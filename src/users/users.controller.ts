import { Controller, Body, Get, Param, Post, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
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
  async deleteUser(@Body('email') email: string) {
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
