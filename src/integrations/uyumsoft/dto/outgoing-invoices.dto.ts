import { PartialType } from '@nestjs/mapped-types';
import { IncomingInvoicesDto } from './incoming-invoices.dto';

export class OutgoingInvoicesDto extends PartialType(IncomingInvoicesDto) {}
