import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleSchema } from './sale.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Sale', schema: SaleSchema }])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
