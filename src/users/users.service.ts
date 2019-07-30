import 'dotenv/config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.model';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUsers() {
    return await this.userModel.find().exec();
  }

  async createUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (user) {
        throw new Error('User exists.');
      }

      const hashedPwd = await bcrypt.hash(password, 12);

      const newUser = new this.userModel({
        email,
        password: hashedPwd,
      });

      const result = await newUser.save();

      return { id: result.id, email: result.email, password: result.password };
    } catch (err) {
      throw err;
    }
  }

  async deleteUser(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException('User does not exist in the database.');
      }

      await this.userModel.findByIdAndDelete({ _id: user.id });

      return {
        msg: `Successfully deleted User (ID): ${user.id}, (Email): ${
          user.email
        }`,
      };
    } catch (err) {
      throw err;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException('User does not exist in the database.');
      }

      const verifyPwd = await bcrypt.compare(password, user.password);

      if (!verifyPwd) {
        throw new Error(
          'User does not exist or check your credentials and try again.',
        );
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          msg: `token expires in 6 hrs`,
          msg2: `<3`,
        },
        process.env.TOKEN,
        { expiresIn: '6h' },
      );

      return {
        userId: user.id,
        token,
        tokenExpiration: 6,
      };
    } catch (err) {
      throw err;
    }
  }
}
