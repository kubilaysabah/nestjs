import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import dayjs from 'dayjs';

import { SoapService } from '@services/soap.service';
import { PrismaService } from '@services/prisma.service';

import { STOPPAGE_RATES } from '@constants/invoice';

import { Invoice } from '@invoice/entities/invoice.entity';

import { IncomingInvoicesDto } from './dto/incoming-invoices.dto';
import { OutgoingInvoicesDto } from './dto/outgoing-invoices.dto';
import {
  IUyumSoftService,
  UyumSoftClient,
  InvoiceItem,
  CreateInvoiceParams,
  InvoiceLine,
  Invoice as UyumSoftInvoice,
  InvoiceTax,
  Invoices,
} from './interface/uyumsoft.interface';

@Injectable()
export class UyumSoftService implements IUyumSoftService {
  private invoices: Invoice[] = [];
  private meta = {
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 0,
  };

  private progress$ = new Subject<Invoices>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly soapService: SoapService,
  ) {}

  getProgress(): Observable<Invoices> {
    return this.progress$.asObservable();
  }

  private async createClient({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    try {
      return this.soapService.client<UyumSoftClient>({
        url: process.env.UYUMSOFT_URL,
        username,
        password,
      });
    } catch (e) {
      console.log(e);
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async incomingInvoice(
    incomingInvoicesDto: IncomingInvoicesDto,
  ): Promise<void> {
    const taxPayer = await this.prismaService.tax_payer.findFirst({
      where: {
        id: incomingInvoicesDto.tax_payer_id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', HttpStatus.NOT_FOUND);
    }

    if (!taxPayer.integrator_id) {
      throw new HttpException(
        "Tax payer's integrator not found",
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      start_date = dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      end_date = dayjs().format('YYYY-MM-DD'),
      page = 1,
      limit = 20,
    } = incomingInvoicesDto;

    const client = await this.createClient({
      username: taxPayer.integrator_username,
      password: taxPayer.integrator_password,
    });

    const { GetInboxInvoices } = client;

    const { result } = await GetInboxInvoices({
      query: {
        Username: taxPayer.integrator_username,
        Password: taxPayer.integrator_password,
        PageIndex: page,
        PageSize: limit,
        ExecutionStartDate: start_date,
        ExecutionEndDate: end_date,
        SetTaken: false,
        OnlyNewestInvoices: false,
      },
    });

    const meta = result?.GetInboxInvoicesResult?.Value?.$attributes;

    this.meta = {
      page: +meta.PageIndex,
      limit: +meta.PageSize,
      totalCount: +meta.TotalCount,
      totalPages: +meta.TotalPages,
    };

    await this.saveToDatabase({
      items: result?.GetInboxInvoicesResult?.Value?.Items,
      type: 1,
      tax_payer_id: incomingInvoicesDto.tax_payer_id,
    });
  }

  async outgoingInvoice(outgoingInvoicesDto: OutgoingInvoicesDto) {
    const taxPayer = await this.prismaService.tax_payer.findFirst({
      where: {
        id: outgoingInvoicesDto.tax_payer_id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', HttpStatus.NOT_FOUND);
    }

    if (!taxPayer.integrator_id) {
      throw new HttpException(
        "Tax payer's integrator not found",
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      start_date = dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      end_date = dayjs().format('YYYY-MM-DD'),
      page = 1,
      limit = 20,
    } = outgoingInvoicesDto;

    const client = await this.createClient({
      username: taxPayer.integrator_username,
      password: taxPayer.integrator_password,
    });

    const { GetOutboxInvoices } = client;

    const { result } = await GetOutboxInvoices({
      query: {
        Username: taxPayer.integrator_username,
        Password: taxPayer.integrator_password,
        PageIndex: page,
        PageSize: limit,
        ExecutionStartDate: start_date,
        ExecutionEndDate: end_date,
        SetTaken: false,
        OnlyNewestInvoices: false,
      },
    });

    const meta = result?.GetOutboxInvoicesResult?.Value?.$attributes;

    this.meta = {
      page: +meta.PageIndex,
      limit: +meta.PageSize,
      totalCount: +meta.TotalCount,
      totalPages: +meta.TotalPages,
    };

    await this.saveToDatabase({
      items: result?.GetOutboxInvoicesResult?.Value?.Items,
      tax_payer_id: outgoingInvoicesDto.tax_payer_id,
      type: 2,
    });
  }

  private getInvoiceLineVAT(invoiceLine: InvoiceLine): InvoiceTax[] {
    if (!invoiceLine.TaxTotal?.TaxSubtotal?.length) {
      return [];
    }

    return invoiceLine.TaxTotal.TaxSubtotal.map((x) => ({
      name: x.TaxCategory.TaxScheme.Name,
      code: x.TaxCategory.TaxScheme.TaxTypeCode,
      currency: x.TaxAmount.$attributes.currencyID,
      rate: parseFloat(x.Percent),
      amount: parseFloat(x.TaxAmount.$value),
    }));
  }

  private getStoppageCodeFromInvoice(item: InvoiceItem): string | null {
    let value: string | null = null;

    if (
      item.Invoice.InvoiceTypeCode === 'TEVKIFAT' &&
      item.Invoice.ProfileID !== 'HKS'
    ) {
      item.Invoice.InvoiceLine.map((invoiceLine) => {
        const find = invoiceLine.WithholdingTaxTotal?.find((x) =>
          x?.TaxSubtotal?.find((y) => y?.TaxCategory?.TaxScheme?.TaxTypeCode),
        );

        if (find) {
          value = find.TaxSubtotal[0].TaxCategory.TaxScheme.TaxTypeCode;
        }
      });

      return value;
    }

    return null;
  }

  private getInvoiceVAT(invoice: UyumSoftInvoice): InvoiceTax[] {
    if (
      !invoice.TaxTotal?.length ||
      !invoice.TaxTotal[0]?.TaxSubtotal?.length
    ) {
      return [];
    }

    return invoice.TaxTotal[0].TaxSubtotal.map((y) => ({
      rate: parseFloat(y.Percent),
      amount: parseFloat(y.TaxAmount.$value),
      name: y.TaxCategory.TaxScheme.Name,
      code: y.TaxCategory.TaxScheme.TaxTypeCode,
      currency: y.TaxAmount.$attributes.currencyID,
    }));
  }

  private getStoppageCodeFromInvoiceLine({
    invoiceLine,
    invoice,
  }: {
    invoice: UyumSoftInvoice;
    invoiceLine: InvoiceLine;
  }): string | null {
    if (invoice.InvoiceTypeCode === 'TEVKIFAT' && invoice.ProfileID !== 'HKS') {
      return (
        invoiceLine.WithholdingTaxTotal[0]?.TaxSubtotal[0].TaxCategory
          ?.TaxScheme?.TaxTypeCode || null
      );
    }

    return null;
  }

  private calcVatDiscounts({
    service_price = 0,
    vat_rate = 0,
    code,
  }: {
    service_price: number;
    vat_rate: number;
    code: number;
  }) {
    const stoppageRate = STOPPAGE_RATES[code];

    if (stoppageRate) {
      const vatDiscountAmountWithStoppage =
        (service_price * vat_rate * stoppageRate) / 100;
      const vatDiscountAmountWithoutStoppage =
        (service_price * vat_rate * (1 - stoppageRate)) / 100;

      return {
        vatDiscountAmountWithStoppage,
        vatDiscountAmountWithoutStoppage,
      };
    }
  }

  private async saveToDatabase({
    items,
    type = 1,
    tax_payer_id,
  }: CreateInvoiceParams) {
    try {
      for await (const item of items) {
        const invoice = item.Invoice;
        const { LegalMonetaryTotal: amounts } = invoice;
        const legalAmounts = invoice?.LegalMonetaryTotal;
        const allowances = invoice.AllowanceCharge || [];
        const taxTotal = item?.Invoice?.TaxTotal;
        const taxSubTotal =
          taxTotal?.length > 0 ? taxTotal[0]?.TaxSubtotal : null;
        const invoiceTaxes = this.getInvoiceVAT(item.Invoice);
        const invoiceVatRate =
          taxSubTotal?.length > 0 ? parseFloat(taxSubTotal[0]?.Percent) : null;

        const invoiceVatAmount =
          taxTotal?.length > 0
            ? parseFloat(taxTotal[0]?.TaxAmount?.$value)
            : null;

        const findInvoice = await this.prismaService.invoice.findFirst({
          where: {
            ETTN: invoice.UUID,
          },
        });

        if (findInvoice) {
          await this.prismaService.invoice.delete({
            where: {
              ETTN: invoice.UUID,
            },
          });
        }

        this.prismaService.$transaction(async (prisma) => {
          const createdInvoice = await prisma.invoice.create({
            data: {
              ETTN: invoice?.UUID,
              name:
                invoice?.AccountingSupplierParty?.Party?.PartyName?.Name ||
                item?.TargetCustomer?.$attributes?.Title,
              tax_number_or_turkish_identity_number:
                item?.TargetCustomer?.$attributes?.VknTckn,
              invoice_number: invoice?.ID,
              invoice_date: dayjs(invoice?.IssueDate).toDate(),
              invoice_type: invoice?.InvoiceTypeCode,
              scenario: invoice?.ProfileID,
              product_or_service_amount: parseFloat(
                amounts?.LineExtensionAmount?.$value,
              ),
              total_amount: parseFloat(amounts?.PayableAmount?.$value),
              total_amount_including_taxes: parseFloat(
                legalAmounts?.TaxInclusiveAmount?.$value,
              ),
              total_amount_excluding_taxes: parseFloat(
                legalAmounts?.TaxExclusiveAmount?.$value,
              ),
              currency: amounts?.PayableAmount?.$attributes?.currencyID,
              discount_amount: parseFloat(allowances[0]?.Amount?.$value),
              increase_amount: parseFloat(allowances[1]?.Amount?.$value),
              type,
              tax_payer_id,
              vat_rate: invoiceVatRate,
              vat_amount: invoiceVatAmount,
              stoppage_code: this.getStoppageCodeFromInvoice(item),
            },
          });

          await prisma.invoice_tax.createMany({
            data: invoiceTaxes.map((tax) => ({
              ...tax,
              invoice_id: createdInvoice.id,
            })),
          });

          this.invoices.push(createdInvoice);
          this.progress$.next({ data: this.invoices, meta: this.meta });

          for (const invoiceLine of item.Invoice.InvoiceLine) {
            if (
              item.Invoice.ProfileID !== 'HKS' &&
              item.Invoice.InvoiceTypeCode === 'SATIS'
            ) {
              await prisma.invoice_line.create({
                data: {
                  invoice_id: createdInvoice.id,
                  name: `%${invoiceVatRate} INDIRILECEK KDV`,
                  product_amount: invoiceVatAmount,
                  stoppage_code: null,
                },
              });
            }

            if (
              item.Invoice.ProfileID !== 'HKS' &&
              item.Invoice.InvoiceTypeCode === 'IADE'
            ) {
              await prisma.invoice_line.create({
                data: {
                  invoice_id: createdInvoice.id,
                  name: `%${createdInvoice.vat_rate} ILAVE EDİLECEK KDV`,
                  product_amount: invoiceVatAmount,
                  stoppage_code: null, // Add default value if stoppage_code is not applicable
                },
              });
            }

            if (
              item.Invoice.InvoiceTypeCode === 'TEVKIFAT' &&
              item.Invoice.ProfileID !== 'HKS'
            ) {
              const vat = invoiceLine?.TaxTotal?.TaxSubtotal?.find((x) => {
                const name =
                  x.TaxCategory?.TaxScheme?.Name?.trim()?.toUpperCase();
                return (
                  name?.includes('KDV') ||
                  name?.includes('GERÇEK USULDE KATMA DEĞER VERGİSİ')
                );
              });

              if (!vat) {
                return;
              }

              const stoppageCode =
                invoiceLine.WithholdingTaxTotal[0]?.TaxSubtotal[0]?.TaxCategory
                  ?.TaxScheme?.TaxTypeCode;

              const vat_rate = parseFloat(vat.Percent);

              const {
                vatDiscountAmountWithoutStoppage,
                vatDiscountAmountWithStoppage,
              } = this.calcVatDiscounts({
                service_price: parseFloat(amounts?.PayableAmount?.$value),
                vat_rate,
                code: +stoppageCode,
              });

              await prisma.invoice_line.createMany({
                data: [
                  {
                    invoice_id: createdInvoice.id,
                    stoppage_code: stoppageCode,
                    name:
                      type === 1
                        ? `%${vat_rate} TEVKIFATLI INDIRILECEK KDV`
                        : `%${vat_rate} HESAPLANAN KDV`,
                    product_amount: vatDiscountAmountWithStoppage,
                  },
                  {
                    invoice_id: createdInvoice.id,
                    stoppage_code: stoppageCode,
                    name:
                      type === 1
                        ? `%${vat_rate} TEVKIFATSIZ INDIRILECEK KDV`
                        : `%${vat_rate} HESAPLANAN KDV`,
                    product_amount: vatDiscountAmountWithoutStoppage,
                  },
                  {
                    invoice_id: createdInvoice.id,
                    stoppage_code: stoppageCode,
                    name:
                      type === 1
                        ? `%${vat_rate} SORUMLU SIFATIYLA ÖDENECEK KDV`
                        : `%${vat_rate} HESAPLANAN KDV`,
                    product_amount: vatDiscountAmountWithoutStoppage,
                  },
                ],
              });
            }

            const createdInvoiceLine = await prisma.invoice_line.create({
              data: {
                invoice_id: createdInvoice.id,
                invoice_type: invoice?.InvoiceTypeCode,
                name: invoiceLine?.Item?.Name,
                product_code: invoiceLine?.Item?.SellersItemIdentification?.ID,
                unit: invoiceLine?.InvoicedQuantity?.$attributes?.unitCode,
                quantity: parseFloat(invoiceLine?.InvoicedQuantity?.$value),
                unit_amount: parseFloat(
                  invoiceLine?.Price?.PriceAmount?.$value,
                ),
                product_amount: parseFloat(
                  invoiceLine?.LineExtensionAmount?.$value,
                ),
                currency:
                  invoiceLine.LineExtensionAmount.$attributes.currencyID,
                stoppage_code: this.getStoppageCodeFromInvoiceLine({
                  invoice,
                  invoiceLine,
                }),
              },
            });

            const invoiceLinesTaxes = this.getInvoiceLineVAT(invoiceLine);

            await prisma.invoice_line_tax.createMany({
              data: invoiceLinesTaxes.map((tax) => ({
                ...tax,
                invoice_line_id: createdInvoiceLine.id,
              })),
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Error while creating invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
