import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import _ from 'lodash';
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
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
          },
        },
        {
          $group: {
            _id: {
              customer: '$CNAME',
              cid: '$CUST',
            },
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
      ])
      .exec();

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
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    const final = sales.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      rebates: parseFloat(sale.rebates.toFixed(2)),
      currentTradeDiscounts:
        parseFloat(sale.currentTradeDiscounts.toFixed(2)) * -1,
      grossProfit: sale.quantity > 0 ? parseFloat(sale.grossProfit.toFixed(2)) : 0,
      grossProfitMargin: sale.quantity > 0 ? parseFloat(sale.grossProfitMargin.toFixed(2)) : 0,
      normalizedTrailingTwelveMonths: rebates
        .filter(obj => obj._id.cid == sale._id.cid)
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin: parseFloat(obj.grossProfitMargin.toFixed(2)),
        }))[0],
      trailingTwelveMonths: rebates
        .filter(obj => obj._id.cid == sale._id.cid)
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (((parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
              numOfRebateDays) /
              ((parseFloat(obj.sales.toFixed(2)) / numOfDays) *
                numOfRebateDays)) *
            100,
        }))[0],
    }));

    return final;
  }

  async getSalesDistinctItem(start: string, end: string) {
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
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
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
          $group: {
            _id: {
              item: '$_id.item',
              iid: '$_id.iid',
            },
            quantity: { $sum: '$quantity' },
            sales: { $sum: '$sales' },
            rebates: { $sum: '$rebates' },
            costs: { $sum: '$costs' },
            currentTradeDiscounts: { $sum: '$currentTradeDiscounts' },
            grossProfit: { $sum: '$grossProfit' },
          },
        },
      ])
      .exec();

    const tradeDiscounts = await this.saleModel
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
              item: '$INAME',
              iid: '$ITEM',
            },
            sales: { $sum: '$SALE' },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: {
              item: '$_id.item',
              iid: '$_id.iid',
            },
            sales: { $sum: '$sales' },
            currentTradeDiscounts: { $sum: '$currentTradeDiscounts' },
          },
        },
      ])
      .exec();

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
            currentTradeDiscounts: 0,
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    const final = sales.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      rebates: parseFloat(sale.rebates.toFixed(2)),
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      currentTradeDiscounts:
        tradeDiscounts
          .filter(obj => obj._id.iid == sale._id.iid)
          .map(obj => obj.currentTradeDiscounts)[0]
          .toFixed(2) * -1,
      grossProfit:
        parseFloat(sale.grossProfit.toFixed(2)) +
        tradeDiscounts
          .filter(obj => obj._id.iid == sale._id.iid)
          .map(obj => obj.currentTradeDiscounts)[0]
          .toFixed(2) *
          -1,
      grossProfitMargin:
        ((parseFloat(sale.grossProfit.toFixed(2)) +
          tradeDiscounts
            .filter(obj => obj._id.iid == sale._id.iid)
            .map(obj => obj.currentTradeDiscounts)[0]
            .toFixed(2) *
            -1) /
          parseFloat(sale.sales.toFixed(2))) *
        100,
      normalizedTrailingTwelveMonths: rebates
        .filter(obj => obj._id.iid == sale._id.iid)
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
      trailingTwelveMonths: rebates
        .filter(obj => obj._id.iid == sale._id.iid)
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
    }));

    return final;
  }

  async getSalesByCust(start: string, end: string, cid: string) {
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
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
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
      ])
      .exec();

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
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    // return rebates;

    return salesByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      rebates: parseFloat(sale.rebates.toFixed(2)),
      currentTradeDiscounts:
        parseFloat(sale.currentTradeDiscounts.toFixed(2)) * -1,
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
      normalizedTrailingTwelveMonths: rebates
        .filter(
          obj => obj._id.cid == sale._id.cid && obj._id.iid == sale._id.iid,
        )
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin: parseFloat(obj.grossProfitMargin.toFixed(2)),
        }))[0],
      trailingTwelveMonths: rebates
        .filter(
          obj => obj._id.iid == sale._id.iid && obj._id.cid == sale._id.cid,
        )
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
    }));
  }

  async getSalesByItem(start: string, end: string, iid: string) {
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
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
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
      ])
      .exec();

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
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    const final = salesByItem.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      rebates: parseFloat(sale.rebates.toFixed(2)),
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
      currentTradeDiscounts:
        parseFloat(sale.currentTradeDiscounts.toFixed(2)) * -1,
      normalizedTrailingTwelveMonths: rebates
        .filter(
          obj => obj._id.cid == sale._id.cid && obj._id.iid == sale._id.iid,
        )
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin: parseFloat(obj.grossProfitMargin.toFixed(2)),
        }))[0],
      trailingTwelveMonths: rebates
        .filter(
          obj => obj._id.iid == sale._id.iid && obj._id.cid == sale._id.cid,
        )
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
    }));

    return final;
  }

  async getSummaryByCust(start: string, end: string, cid: string) {
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
            CUST: { $in: cid.split('-') },
          },
        },
        {
          $group: {
            _id: {
              customer: '$CNAME',
              cid: '$CUST',
            },
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
      ])
      .exec();

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
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    const final = summaryByCust.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      rebates: parseFloat(sale.rebates.toFixed(2)),
      currentTradeDiscounts:
        parseFloat(sale.currentTradeDiscounts.toFixed(2)) * -1,
      grossProfit: parseFloat(sale.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(sale.grossProfitMargin.toFixed(2)),
      normalizedTrailingTwelveMonths: rebates
        .filter(obj => obj._id.cid == sale._id.cid)
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin: parseFloat(obj.grossProfitMargin.toFixed(2)),
        }))[0],
      trailingTwelveMonths: rebates
        .filter(obj => obj._id.cid == sale._id.cid)
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
    }));

    return final;
  }

  async getSummaryByItem(start: string, end: string, iid: string) {
    const rebateStartDate = new Date(
      new Date(end).setFullYear(new Date(end).getFullYear() - 1),
    );
    const rebateEndDate = new Date(end);

    const numOfDays =
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24);
    const numOfRebateDays =
      (rebateEndDate.getTime() - rebateStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const rebates = await this.saleModel
      .aggregate([
        {
          $match: {
            DATE: { $gte: rebateStartDate, $lte: rebateEndDate },
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
            _quantity: { $sum: '$QTY' },
            _sales: { $sum: '$SALE' },
            _costs: { $sum: '$COST' },
            _rebates: { $sum: '$REBATECREDIT' },
          },
        },
        {
          $project: {
            quantity: {
              $multiply: [
                { $divide: ['$_quantity', numOfRebateDays] },
                numOfDays,
              ],
            },
            sales: {
              $multiply: [{ $divide: ['$_sales', numOfRebateDays] }, numOfDays],
            },
            costs: {
              $multiply: [{ $divide: ['$_costs', numOfRebateDays] }, numOfDays],
            },
            rebates: {
              $multiply: [
                { $divide: ['$_rebates', numOfRebateDays] },
                numOfDays,
              ],
            },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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
          $group: {
            _id: {
              item: '$_id.item',
              iid: '$_id.iid',
            },
            quantity: { $sum: '$quantity' },
            sales: { $sum: '$sales' },
            rebates: { $sum: '$rebates' },
            costs: { $sum: '$costs' },
            currentTradeDiscounts: { $sum: '$currentTradeDiscounts' },
            grossProfit: { $sum: '$grossProfit' },
          },
        },
      ])
      .exec();

    const tradeDiscounts = await this.saleModel
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
            sales: { $sum: '$SALE' },
          },
        },
        {
          $addFields: {
            currentTradeDiscounts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$_id.cid', '1300'] },
                    then: { $multiply: ['$sales', 0.075] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2091'] },
                    then: { $multiply: ['$sales', 0.03] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1716'] },
                    then: { $multiply: ['$sales', 0.05] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2084'] },
                    then: { $multiply: ['$sales', 0.0324] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '9988'] },
                    then: { $multiply: ['$sales', 0.08] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '2614'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1070'] },
                    then: { $multiply: ['$sales', 0.01] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1402'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                  {
                    case: { $eq: ['$_id.cid', '1404'] },
                    then: { $multiply: ['$sales', 0.07] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: {
              item: '$_id.item',
              iid: '$_id.iid',
            },
            sales: { $sum: '$sales' },
            currentTradeDiscounts: { $sum: '$currentTradeDiscounts' },
          },
        },
      ])
      .exec();

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
            currentTradeDiscounts: 0,
          },
        },
        {
          $addFields: {
            grossProfit: {
              $cond: {
                if: { $gt: ['$sales', 0] },
                then: {
                  $add: [
                    '$rebates',
                    {
                      $subtract: [
                        '$sales',
                        { $add: ['$currentTradeDiscounts', '$costs'] },
                      ],
                    },
                  ],
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
                            {
                              $subtract: [
                                '$sales',
                                { $add: ['$currentTradeDiscounts', '$costs'] },
                              ],
                            },
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

    const final = summaryByItem.map(sale => ({
      _id: sale._id,
      quantity: sale.quantity,
      avgPrice:
        sale.quantity > 0
          ? parseFloat(sale.sales.toFixed(2)) / sale.quantity
          : 0,
      afterRebateAvgPrice:
        sale.quantity > 0
          ? (parseFloat(sale.sales.toFixed(2)) +
              parseFloat(sale.rebates.toFixed(2))) /
            sale.quantity
          : 0,
      sales: parseFloat(sale.sales.toFixed(2)),
      costs: parseFloat(sale.costs.toFixed(2)) * -1,
      rebates: parseFloat(sale.rebates.toFixed(2)),
      currentTradeDiscounts:
        tradeDiscounts
          .filter(obj => obj._id.iid == sale._id.iid)
          .map(obj => obj.currentTradeDiscounts)[0]
          .toFixed(2) * -1,
      grossProfit:
        parseFloat(sale.grossProfit.toFixed(2)) +
        tradeDiscounts
          .filter(obj => obj._id.iid == sale._id.iid)
          .map(obj => obj.currentTradeDiscounts)[0]
          .toFixed(2) *
          -1,
      grossProfitMargin:
        ((parseFloat(sale.grossProfit.toFixed(2)) +
          tradeDiscounts
            .filter(obj => obj._id.iid == sale._id.iid)
            .map(obj => obj.currentTradeDiscounts)[0]
            .toFixed(2) *
            -1) /
          parseFloat(sale.sales.toFixed(2))) *
        100,
      normalizedTrailingTwelveMonths: rebates
        .filter(obj => obj._id.iid == sale._id.iid)
        .map(obj => ({
          quantity: parseFloat(obj.quantity.toFixed()),
          sales: parseFloat(obj.sales.toFixed(2)),
          costs: parseFloat(obj.costs.toFixed(2)) * -1,
          rebates: parseFloat(obj.rebates.toFixed(2)),
          currentTradeDiscounts:
            parseFloat(obj.currentTradeDiscounts.toFixed(2)) * -1,
          grossProfit: parseFloat(obj.grossProfit.toFixed(2)),
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
      trailingTwelveMonths: rebates
        .filter(obj => obj._id.iid == sale._id.iid)
        .map(obj => ({
          quantity:
            (parseFloat(obj.quantity.toFixed()) / numOfDays) * numOfRebateDays,
          sales:
            (parseFloat(obj.sales.toFixed(2)) / numOfDays) * numOfRebateDays,
          costs:
            (parseFloat(obj.costs.toFixed(2)) / -numOfDays) * numOfRebateDays,
          rebates:
            (parseFloat(obj.rebates.toFixed(2)) / numOfDays) * numOfRebateDays,
          currentTradeDiscounts:
            (parseFloat(obj.currentTradeDiscounts.toFixed(2)) / -numOfDays) *
            numOfRebateDays,
          grossProfit:
            (parseFloat(obj.grossProfit.toFixed(2)) / numOfDays) *
            numOfRebateDays,
          grossprofitMargin:
            (parseFloat(obj.grossProfit.toFixed(2)) /
              parseFloat(obj.sales.toFixed(2))) *
            100,
        }))[0],
    }));

    return final;
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

  async getDistinctItemsByHeader(start: string, end: string) {
    return await this.saleModel
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
      sales: parseFloat(sale.sales.toFixed(2)),
      avgSalePrice: parseFloat(sale.avgSalePrice.toFixed(2)),
    }));
  }
}
