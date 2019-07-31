import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { AuthService } from '../auth/auth.service';
import { SaleSchema } from './sale.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Sale', schema: SaleSchema }])],
  controllers: [SalesController],
  providers: [SalesService, AuthService],
})
export class SalesModule {}
