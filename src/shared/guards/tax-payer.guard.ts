import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export class TaxPayerGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const taxPayerId = request.headers['tax_payer_id'];
    const user = request['user'];

    if (!taxPayerId) {
      throw new HttpException('Tax payer ID not found', HttpStatus.BAD_REQUEST);
    }

    const taxPayer = await this.prismaService.tax_payer.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
