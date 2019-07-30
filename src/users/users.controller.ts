import { Controller, Body, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.usersService.getUsers();
  }

  @Post()
  async createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.createUser(email, password);
  }
}
