import 'dotenv/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sale } from './sale.model';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class SalesService {
  private sales: Sale[] = [];

  constructor(@InjectModel('Sale') private readonly saleModel: Model<Sale>) {}

  async getSales(start: string, end: string, authHeader: any) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async getSalesByCust(
    start: string,
    end: string,
    cid: string,
    authHeader: any,
  ) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async getSalesByItem(
    start: string,
    end: string,
    iid: string,
    authHeader: any,
  ) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async getSummaryByCust(
    start: string,
    end: string,
    cid: string,
    authHeader: any,
  ) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async getSummaryByItem(
    start: string,
    end: string,
    iid: string,
    authHeader: any,
  ) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async verifyUser(authHeader: string) {
    let isAuth;

    if (!authHeader) {
      isAuth = false;
    }

    // Authorization Bearer <Token>
    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
      isAuth = false;
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.TOKEN);
    } catch (err) {
      isAuth = false;
    }

    if (!decodedToken) {
      isAuth = false;
    }

    isAuth = true;

    return {
      userId: decodedToken.userId,
      email: decodedToken.email,
      auth: isAuth,
    };
  }

  async getDistinctCustomers(start: string, end: string, authHeader: any) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async getDistinctItems(start: string, end: string, authHeader: any) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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
}
