import * as jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async verifyUser(authHeader: string) {
    let isAuth, decodedToken;

    const accessDenied = 'Please login to access this function.';

    if (!authHeader) {
      isAuth = false;
      return { accessDenied };
    }

    // Authorization Bearer <Token>
    const [_, token] = authHeader.split(' ');
    if (!token || token === '') {
      isAuth = false;
      return { accessDenied };
    }

    try {
      decodedToken = jwt.verify(token, process.env.TOKEN);
    } catch (err) {
      isAuth = false;
      return { accessDenied };
    }

    if (!decodedToken) {
      isAuth = false;
      return { accessDenied };
    }

    isAuth = true;

    return {
      userId: decodedToken.userId,
      email: decodedToken.email,
      auth: isAuth,
    };
  }
}
