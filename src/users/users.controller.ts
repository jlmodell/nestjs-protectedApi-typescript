import { Controller, Body, Get, Post, Delete, Headers } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getUsers(@Headers('authorization') authHeader: any) {
    const verify = await this.authService.verifyUser(authHeader);
    if (!verify.auth) {
      return { ...verify };
    }
    return await this.usersService.getUsers();
  }

  @Post('register')
  async createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.createUser(email, password);
  }

  @Delete('delete')
  async deleteUser(
    @Body('email') email: string,
    @Headers('authorization') authHeader: any,
  ) {
    const verify = await this.authService.verifyUser(authHeader);
    if (!verify.auth) {
      return { ...verify };
    }
    return await this.usersService.deleteUser(email);
  }

  @Get('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.login(email, password);
  }
}
