import { HttpException, Injectable } from '@nestjs/common';

import { v4 as uuid } from 'uuid';
import axios from 'axios';

import { XmlToJSONService } from '@services/xml-to-json.service';
import { PrismaService } from '@services/prisma.service';

import type { PayDto } from './dto/pay.dto';
import type { NomupayEntity } from './entities/nomupay.entity';
import type { PayEntity } from './entities/pay.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly xmlToJSONService: XmlToJSONService,
    private readonly prismaService: PrismaService,
  ) {}

  async pay({
    user_id,
    payDto,
  }: {
    user_id: string;
    payDto: PayDto;
  }): Promise<PayEntity> {
    const customer = await this.prismaService.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!customer) {
      throw new HttpException('User not found', 404);
    }

    const raw = `<?xml version="1.0" encoding="ISO-8859-9"?>
      <INPUT>
        <ServiceType>WDTicket</ServiceType>
        <OperationType>Sale3DSURLProxy</OperationType>
        <Token>
          <UserCode>${process.env.NOMUPAY_API_USER}</UserCode>
          <Pin>${process.env.NOMUPAY_API_PIN}</Pin>
        </Token>
        <Price>${parseFloat(payDto.price)}</Price>
        <CurrencyCode>TRY</CurrencyCode>
        <MPAY>${uuid()}</MPAY>
        <ErrorURL>${payDto.errorURL}</ErrorURL>
        <SuccessURL>${payDto.successURL}</SuccessURL>
        <Description>${payDto.description}</Description>
        <PaymentContent>${payDto.content}</PaymentContent>
        <CardTokenization>
          <RequestType>1</RequestType>
          <CustomerId>${customer}</CustomerId>
          <ValidityPeriod>0</ValidityPeriod>
        </CardTokenization>
        <PaymentTypeId>1</PaymentTypeId>
        <InstallmentOptions>0</InstallmentOptions>
        <CustomerInfo>
          <CustomerName>${customer.firstname}</CustomerName>
          <CustomerSurname>${customer.lastname}</CustomerSurname>
          <CustomerEmail>${customer.email}</CustomerEmail>
        </CustomerInfo>
        <Language>TR</Language>
      </INPUT>`;

    try {
      const response = await axios({
        url: process.env.NOMUPAY_TEST_URL,
        maxBodyLength: Infinity,
        method: 'POST',
        data: raw,
        headers: {
          'Content-Type': 'application/xml',
        },
        withCredentials: true,
      });

      const { Result } = await this.xmlToJSONService.parse<NomupayEntity>(
        response.data,
      );

      const statusCode = Result.Item.find((item) => item.$.Key === 'StatusCode')
        .$.Value;
      const resultCode = Result.Item.find((item) => item.$.Key === 'ResultCode')
        .$.Value;
      const resultMessage = Result.Item.find(
        (item) => item.$.Key === 'ResultMessage',
      ).$.Value;
      const redirectUrl = Result.Item.find(
        (item) => item.$.Key === 'RedirectUrl',
      ).$.Value;

      return {
        statusCode,
        resultCode,
        resultMessage,
        redirectUrl,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException('Payment failed', 500);
    }
  }
}
