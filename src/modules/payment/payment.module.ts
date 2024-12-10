import { Module } from '@nestjs/common';

import { XmlToJSONService } from '@services/xml-to-json.service';
import { PrismaService } from '@services/prisma.service';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, XmlToJSONService, PrismaService],
})
export class PaymentModule {}
