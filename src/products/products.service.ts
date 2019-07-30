import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product } from './product.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(title: string, description: string, price: number) {
    const newProduct = new this.productModel({
      title,
      description,
      price,
    });

    const result = await newProduct.save();

    return result.id as string;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();
    return products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    }));
  }

  async getProduct(prodId: string) {
    const product = await this.findProduct(prodId);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    prodId: string,
    title: string,
    description: string,
    price: number,
  ) {
    const updatedProduct = await this.findProduct(prodId);

    if (title) {
      updatedProduct.title = title;
    }
    if (description) {
      updatedProduct.description = description;
    }
    if (price) {
      updatedProduct.price = price;
    }

    const result = await updatedProduct.save();

    return result;
  }

  async deleteProduct(prodId: string) {
    const result = await this.productModel.findByIdAndDelete(prodId).exec();

    return result;
  }

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.productModel.findById(id).exec();
    } catch (err) {
      throw new NotFoundException('ID was not found in the database.');
    }

    if (!product) {
      throw new NotFoundException('ID was not found in the database.');
    }

    return product;
  }
}
