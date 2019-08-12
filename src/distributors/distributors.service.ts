import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Distributor } from './distributor.model';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class DistributorService {
  private distributors: Distributor[] = [];

  constructor(
    @InjectModel('Distributor')
    private readonly distributorModel: Model<Distributor>,
  ) {}

  async getDistributor(dist: string) {
    const distributors = await this.distributorModel
      .aggregate([
        {
          $match: {
            distributor: dist,
          },
        },
      ])
      .exec();

    return distributors.map(dist => ({
      distributor: dist.distributor,
      payment_terms: dist.payment_terms,
      admin_fees: dist.admin_fees,
      trace_fees: dist.trace_fees,
      freight: dist.freight,
      commission: dist.commission,
      overhead: dist.overhead,
      labor_costs: dist.labor_costs,
      cash_discount: dist.cash_discount,
    }));
  }
}
