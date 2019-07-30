import 'dotenv/config';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.model';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async getUsers(authHeader: any) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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

  async deleteUser(email: string, authHeader: any) {
    try {
      const verify = await this.verifyUser(authHeader);
      if (!verify.auth) {
        throw UnauthorizedException;
      }
    } catch (err) {
      throw UnauthorizedException;
    }

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
          hiddenmsg: `<3 meagan`,
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
}
