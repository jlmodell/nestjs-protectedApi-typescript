import 'dotenv/config';
var round = require('mongo-round');
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sale } from './sale.model';

import * as jwt from 'jsonwebtoken';

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

  async getSalesDistinctCust(start: string, end: string) {
    const sales = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
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
            rebates: { $sum: '$REBATECREDIT' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ])
      .exec();

    return sales.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      rebates: sale.rebates,
      costs: sale.costs,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
    }));
  }

  async getSalesDistinctItem(start: string, end: string) {
    const sales = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
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
            rebates: { $sum: '$REBATECREDIT' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ])
      .exec();

    return sales.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      rebates: sale.rebates,
      costs: sale.costs,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
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
            rebates: { $sum: '$REBATECREDIT' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ])
      .exec();

    return salesByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      rebates: sale.rebates,
      costs: sale.costs,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
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
            rebates: { $sum: '$REBATECREDIT' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ])
      .exec();

    return salesByItem.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      rebates: sale.rebates,
      costs: sale.costs,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
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
            rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
          },
        },
      ])
      .exec();

    return summaryByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      costs: sale.costs,
      rebates: sale.rebates,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
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
            rebates: { $sum: '$REBATECREDIT' },
            costs: { $sum: '$COST' },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: ['$rebates', { $subtract: ['$sales', '$costs'] }],
                },
                else: 0,
              },
            },
            grossProfitMargin: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            '$rebates',
                            { $subtract: ['$sales', '$costs'] },
                          ],
                        },
                        '$sales',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        {
          $unwind: '$sales',
        },
        {
          $sort: {
            sales: -1,
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

  async getDistinctCustomers(start: string, end: string) {
    const summary = await this.saleModel
      .aggregate([
        {
          $project: {
            cust: {
              $concat: ['$CNAME', '|', '$CUST'],
            },
            DATE: 1,
            CUST: 1,
            CNAME: 1,
          },
        },
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
          },
        },
        {
          $group: {
            _id: null,
            customer: {
              $addToSet: {
                name: '$cust',
              },
            },
          },
        },
        {
          $unwind: '$customer',
        },
        {
          $sort: {
            customer: 1,
          },
        },
        {
          $group: {
            _id: null,
            customer: {
              $push: '$customer',
            },
          },
        },
      ])
      .exec();

    return summary;
  }

  async getDistinctItems(start: string, end: string) {
    const summary = await this.saleModel
      .aggregate([
        {
          $project: {
            itemList: {
              $concat: ['$ITEM', '|', '$INAME'],
            },
            DATE: 1,
            ITEM: 1,
            INAME: 1,
          },
        },
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
          },
        },
        {
          $group: {
            _id: null,
            item: {
              $addToSet: {
                name: '$itemList',
              },
            },
          },
        },
        {
          $unwind: '$item',
        },
        {
          $sort: {
            item: 1,
          },
        },
        {
          $group: {
            _id: null,
            item: {
              $push: '$item',
            },
          },
        },
      ])
      .exec();

    return summary;
  }

  async getAvgPrice(cid: string, iid: string, start: string, end: string) {
    const avgPrice = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: new Date(start), $lte: new Date(end) },
            CUST: cid,
            ITEM: iid,
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
          },
        },
        {
          $addFields: {
            avgSalePrice: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: { $divide: ['$sales', '$quantity'] },
                else: 0,
              },
            },
          },
        },
      ])
      .exec();

    return avgPrice.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      sales: sale.sales,
      avgSalePrice: parseFloat(sale.avgSalePrice.toFixed(2)),
    }));
  }
}
