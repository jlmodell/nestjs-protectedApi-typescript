import { Controller, Get, Param, Headers } from '@nestjs/common';

import { DistributorService } from './distributors.service';
import { AuthService } from '../auth/auth.service';

@Controller('distributor')
export class DistributorController {
  constructor(
    private readonly distributorsService: DistributorService,
    private readonly authService: AuthService,
  ) {}

  // GET distributor info
  @Get(':dist')
  async getSales(
    @Param('dist') dist: string,
    @Headers('authorization') authHeader: string,
  ) {
    const verify = await this.authService.verifyUser(authHeader);
    if (!verify.auth) {
      return { ...verify };
    }
    return await this.distributorsService.getDistributor(dist);
  }

  @Get('distinct')
  async getDistinctDist(@Headers('authorization') authHeader: string) {
    const verify = await this.authService.verifyUser(authHeader);
    if (!verify.auth) {
      return { ...verify };
    }
    return await this.distributorsService.getDistinctDist();
  }
}
