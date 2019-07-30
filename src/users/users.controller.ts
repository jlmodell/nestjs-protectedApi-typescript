import { Controller, Body, Get, Post, Delete, Headers } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Headers('authorization') authHeader: any) {
    return await this.usersService.getUsers(authHeader);
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
    return await this.usersService.deleteUser(email, authHeader);
  }

  @Get('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.login(email, password);
  }
}
