import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DistributorController } from './distributors.controller';
import { DistributorService } from './distributors.service';
import { AuthService } from '../auth/auth.service';
import { DistributorSchema } from './distributor.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Distributor', schema: DistributorSchema },
    ]),
  ],
  controllers: [DistributorController],
  providers: [DistributorService, AuthService],
})
export class DistributorsModule {}
