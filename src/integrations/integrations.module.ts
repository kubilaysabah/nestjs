import { Module } from '@nestjs/common';
import { UyumsoftModule } from './uyumsoft/uyumsoft.module';

@Module({
  imports: [UyumsoftModule],
  exports: [UyumsoftModule],
})
export class IntegrationsModule {}
