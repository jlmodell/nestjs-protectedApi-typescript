import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemController } from './items.controller';
import { ItemService } from './items.service';
import { AuthService } from '../auth/auth.service';
import { ItemSchema } from './item.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }])],
  controllers: [ItemController],
  providers: [ItemService, AuthService],
})
export class ItemsModule {}
