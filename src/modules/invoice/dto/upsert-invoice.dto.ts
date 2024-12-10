import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpsertInvoiceDto extends PartialType(CreateInvoiceDto) {}
