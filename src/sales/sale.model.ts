import * as mongoose from 'mongoose';

export const SaleSchema = new mongoose.Schema({
  ID: String,
  YEAR: String,
  DATE: String,
  QTR: String,
  CUST: String,
  CNAME: String,
  ITEM: String,
  INAME: String,
  TYPE: String,
  STER: String,
  QTY: Number,
  SALE: Number,
  COST: Number,
  REP: String,
  COMMISSIONS: Number,
  AVGCOSTPERQTY: Number,
  AVGSALEPERQTY: Number,
});

export interface Sale extends mongoose.Document {
  id: string;
  YEAR: string;
  DATE: string;
  QTR: string;
  CUST: string;
  REP: string;
  ITEM: string;
  INAME: string;
  CNAME: string;
  QTY: number;
  SALE: number;
  COST: number;
  COMMISSSION: number;
  AVGCOSTPERQTY: number;
  AVGSALEPERQTY: number;
}
