import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Item } from './item.model';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class ItemService {
  private items: Item[] = [];

  constructor(
    @InjectModel('Item')
    private readonly itemModel: Model<Item>,
  ) {}

  async getItemCost(iid: string) {
    const item = await this.itemModel
      .aggregate([
        {
          $match: {
            item: iid,
          },
        },
      ])
      .exec();

    return item.map(i => ({
      item: i.item,
      cost: i.cost,
    }));
  }
}
