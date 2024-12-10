import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, PaginateService],
  exports: [UserService],
})
export class UserModule {}
