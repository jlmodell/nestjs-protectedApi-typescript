import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';
import { DistributorsModule } from './distributors/distributors.module';
import { ItemsModule } from './items/items.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    SalesModule,
    UsersModule,
    ItemsModule,
    DistributorsModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
