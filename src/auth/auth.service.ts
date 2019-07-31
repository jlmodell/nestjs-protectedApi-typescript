import * as jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async verifyUser(authHeader: string) {
    const accessDenied = {
      msg: 'Please login to access this function.',
      auth: false,
    };

    if (!authHeader) {
      return accessDenied;
    }

    try {
      // Authorization Bearer <Token>
      const [_, token] = authHeader.split(' ');
      if (!token || token === '') {
        return accessDenied;
      }

      const decodedToken = jwt.verify(token, process.env.TOKEN);
      if (!decodedToken) {
        return accessDenied;
      }

      return {
        userId: decodedToken.userId,
        email: decodedToken.email,
        auth: true,
      };
    } catch (err) {
      return accessDenied;
    }
  }
}
