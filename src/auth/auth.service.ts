import * as jwt from 'jsonwebtoken';

import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async verifyUser(authHeader: string) {
    let isAuth, authMsg, decodedToken;

    authMsg = {
      auth: null,
      msg: 'Please login to access this function.',
    };

    if (!authHeader) {
      isAuth = false;
      return authMsg;
    }

    // Authorization Bearer <Token>
    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
      isAuth = false;
      return authMsg;
    }

    try {
      decodedToken = jwt.verify(token, process.env.TOKEN);
    } catch (err) {
      isAuth = false;
      return authMsg;
    }

    if (!decodedToken) {
      isAuth = false;
      return authMsg;
    }

    isAuth = true;

    return {
      userId: decodedToken.userId || null,
      email: decodedToken.email || null,
      auth: isAuth || null,
    };
  }
}
