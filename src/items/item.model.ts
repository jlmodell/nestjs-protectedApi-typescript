import * as mongoose from 'mongoose';

export const ItemSchema = new mongoose.Schema({
  item: String,
  cost: Number,
});

export interface Item extends mongoose.Document {
  item: string;
  cost: number;
}
