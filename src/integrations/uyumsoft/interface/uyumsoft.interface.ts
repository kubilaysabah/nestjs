import { IncomingInvoicesDto } from '../dto/incoming-invoices.dto';
import { OutgoingInvoicesDto } from '../dto/outgoing-invoices.dto';
import { Invoice as InvoiceEntity } from '@invoice/entities/invoice.entity';

export interface GetInvoicesParams {
  query: {
    Username: string;
    Password: string;
    PageIndex: number;
    PageSize: number;
    ExecutionStartDate: string | Date;
    ExecutionEndDate: string | Date;
    SetTaken: boolean;
    OnlyNewestInvoices: boolean;
  };
}

export interface Amount {
  $attributes?: {
    currencyID?: string;
  };
  $value?: string;
}

export interface AccountingCustomerParty {
  Party?: {
    PartyIdentification?: {
      ID?: Amount;
    }[];
    PartyName: {
      Name: string;
    };
    PostalAddress: { [key: string]: string };
  };
}

export interface AccountingSupplierParty {
  Party?: {
    WebsiteURI?: string;
    PartIdentification?: {
      ID: Amount;
    }[];
    PartyName?: {
      Name?: string;
    };
    PostalAddress?: {
      StreetName?: string;
      BuildingName?: string;
      BuildingNumber?: string;
      CitySubdivisionName?: string;
      CityName?: string;
      PostalZone?: string;
      Country: {
        Name?: string;
      };
    };
    PartyTaxScheme?: {
      TaxScheme?: {
        Name?: string;
      };
    };
    Contact: {
      Telephone: string;
      Telefax: string;
      ElectronicMail: string;
    };
    Person?: {
      FirstName?: string;
      FamilyName?: string;
    };
  };
}

export interface InvoiceLine {
  VAT_Rate?: string;
  LineExtensionAmount?: Amount;
  Item?: {
    Name?: string;
    SellersItemIdentification?: {
      ID?: string;
    };
  };
  InvoicedQuantity?: {
    $attributes: {
      unitCode?: string;
    };
    $value?: string;
  };
  Price?: {
    PriceAmount?: {
      $value: string;
    };
  };
  TaxTotal?: {
    TaxSubtotal?: {
      Percent?: string;
      TaxCategory?: {
        TaxScheme?: {
          Name?: string;
          TaxTypeCode?: string;
        };
      };
      TaxAmount?: Amount;
      TaxableAmount?: Amount;
    }[];
    TaxAmount?: Amount;
  };
  WithholdingTaxTotal: {
    TaxAmount: Amount;
    TaxSubtotal: {
      TaxableAmount: Amount;
      TaxAmount: Amount;
      Percent: string;
      TaxCategory: {
        TaxScheme: {
          Name: string;
          TaxTypeCode: string;
        };
      };
    }[];
  }[];
}

export interface Invoice {
  $attributes: {
    schemaLocation: string;
  };
  UBLExtension: string;
  CustomizationID: string;
  CopyIndicator: string;
  IssueTime: string;
  Note: {
    $attributes: {
      languageID: string;
    };
    $value: string;
  }[];
  InvoiceLine?: InvoiceLine[];
  UUID?: string;
  ID?: string;
  IssueDate?: string;
  InvoiceTypeCode?: string;
  ProfileID?: string;
  AccountingSupplierParty?: AccountingSupplierParty;
  AccountingCustomerParty?: AccountingCustomerParty;
  TaxTotal?: {
    TaxAmount?: Amount;
    TaxSubtotal?: {
      TaxAmount?: Amount;
      Percent?: string;
      TaxCategory?: {
        TaxScheme?: {
          Name?: string;
          TaxTypeCode?: string;
        };
      };
    }[];
  }[];
  LegalMonetaryTotal?: {
    PayableAmount?: Amount;
    LineExtensionAmount?: Amount;
    TaxInclusiveAmount?: Amount;
    TaxExclusiveAmount?: Amount;
  };
  AllowanceCharge?: {
    Amount?: {
      $value?: string;
    };
  }[];
  Signature?: {
    ID?: {
      $attributes?: {
        schemeID?: string;
      };
      $value?: string;
    };
  }[];
  TargetCustomer?: {
    $attributes?: {
      Alias?: string;
    };
  };
}

export interface InvoiceItem {
  Invoice: Invoice;
  TargetCustomer: {
    $attributes: {
      VknTckn: string;
      Alias: string;
      Title: string;
    };
  };
  Scenario: string;
}

export interface InvoicesResult {
  $attributes: {
    PageIndex: string;
    PageSize: string;
    TotalCount: string;
    TotalPages: string;
  };
  Items: InvoiceItem[];
}

export interface CreateInvoiceParams {
  readonly tax_payer_id: string;
  readonly items: InvoiceItem[];
  readonly type?: number;
}

export interface InvoiceTax {
  readonly name: string;
  readonly code: string;
  readonly currency: string;
  readonly amount: number;
  readonly rate: number;
}

export interface GetInboxInvoicesResult {
  result?: {
    GetInboxInvoicesResult?: {
      Value?: InvoicesResult;
    };
  };
}

export interface GetOutboxInvoicesResult {
  result?: {
    GetOutboxInvoicesResult?: {
      Value?: InvoicesResult;
    };
  };
}

export interface UyumSoftClient {
  GetInboxInvoices: (
    params: GetInvoicesParams,
  ) => Promise<GetInboxInvoicesResult>;
  GetOutboxInvoices: (
    params: GetInvoicesParams,
  ) => Promise<GetOutboxInvoicesResult>;
}

export interface IUyumSoftService {
  incomingInvoice: (incomingInvoicesDto: IncomingInvoicesDto) => Promise<void>;
  outgoingInvoice: (outgoingInvoicesDto: OutgoingInvoicesDto) => Promise<void>;
}

export interface Invoices {
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  data: InvoiceEntity[];
}
