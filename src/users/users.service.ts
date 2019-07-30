import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.model';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUsers() {
    return await this.userModel.find().exec();
  }

  async createUser(email: string, password: string) {
    // const user = await this.userModel.find({ email }).exec();
    // if (user) {
    //   throw new Error('User exists with that e-mail address.');
    // }

    const newUser = new this.userModel({
      email,
      password,
    });

    try {
      const result = await newUser.save();
      return { id: result.id, email: result.email, password: null };
    } catch (err) {
      throw err;
    }
  }
}
