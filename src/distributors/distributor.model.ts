import * as mongoose from 'mongoose';

export const DistributorSchema = new mongoose.Schema({
  distributor: String,
  payment_terms: Number,
  admin_fees: Number,
  trace_fees: Number,
  freight: Number,
  commission: Number,
  overhead: Number,
  labor_costs: Number,
  cash_discount: Number,
});

export interface Distributor extends mongoose.Document {
  distributor: string;
  payment_terms: number;
  admin_fees: number;
  trace_fees: number;
  freight: number;
  commission: number;
  overhead: number;
  labor_costs: number;
  cash_discount: number;
}
