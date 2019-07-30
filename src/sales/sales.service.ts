import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sale } from './sale.model';

@Injectable()
export class SalesService {
  private sales: Sale[] = [];

  constructor(@InjectModel('Sale') private readonly saleModel: Model<Sale>) {}

  async getSales(start: string, end: string) {
    const sales = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
          },
        },
      ])
      .exec();

    return sales.map(sale => ({
      _id: sale.id,
      year: sale.YEAR,
      date: sale.DATE,
      cid: sale.CUST,
      customer: sale.CNAME,
      iid: sale.ITEM,
      item: sale.INAME,
      quantity: sale.QTY,
      sales: sale.SALE,
      costs: sale.COST,
    }));
  }

  async getSalesByCust(start: string, end: string, cid: string) {
    const salesByCust = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
            CUST: { $in: cid.split('-') },
          },
        },
        {
          $group: {
            _id: {
              customer: '$CNAME',
              cid: '$CUST',
              item: '$INAME',
              iid: '$ITEM',
            },
            quantity: { $sum: '$QTY' },
            sales: { $sum: '$SALE' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: { $subtract: ['$sales', '$costs'] },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [{ $subtract: ['$sales', '$costs'] }, '$sales'],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ])
      .exec();

    return salesByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      costs: sale.costs,
      grossProfit: sale.grossProfit,
      grossProfitMargin: sale.grossProfitMargin,
    }));
  }

  async getSalesByItem(start: string, end: string, iid: string) {
    const salesByItem = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
            ITEM: { $in: iid.split('-') },
          },
        },
        {
          $group: {
            _id: {
              customer: '$CNAME',
              cid: '$CUST',
              item: '$INAME',
              iid: '$ITEM',
            },
            quantity: { $sum: '$QTY' },
            sales: { $sum: '$SALE' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: { $subtract: ['$sales', '$costs'] },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [{ $subtract: ['$sales', '$costs'] }, '$sales'],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ])
      .exec();

    return salesByItem.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      costs: sale.costs,
      grossProfit: sale.grossProfit,
      grossProfitMargin: sale.grossProfitMargin,
    }));
  }

  async getSummaryByCust(start: string, end: string, cid: string) {
    const summaryByCust = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
            CUST: { $in: cid.split('-') },
          },
        },
        {
          $group: {
            _id: {
              customer: '$CNAME',
              cid: '$CUST',
            },
            quantity: { $sum: '$QTY' },
            sales: { $sum: '$SALE' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: { $subtract: ['$sales', '$costs'] },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [{ $subtract: ['$sales', '$costs'] }, '$sales'],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ])
      .exec();

    return summaryByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      costs: sale.costs,
      grossProfit: sale.grossProfit,
      grossProfitMargin: sale.grossProfitMargin,
    }));
  }

  async getSummaryByItem(start: string, end: string, iid: string) {
    const summaryByItem = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
            ITEM: { $in: iid.split('-') },
          },
        },
        {
          $group: {
            _id: {
              item: '$INAME',
              iid: '$ITEM',
            },
            quantity: { $sum: '$QTY' },
            sales: { $sum: '$SALE' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: { $subtract: ['$sales', '$costs'] },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [{ $subtract: ['$sales', '$costs'] }, '$sales'],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ])
      .exec();

    return summaryByItem.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      costs: sale.costs,
      grossProfit: sale.grossProfit,
      grossProfitMargin: sale.grossProfitMargin,
    }));
  }
}
