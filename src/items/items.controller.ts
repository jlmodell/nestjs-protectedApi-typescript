import { Controller, Get, Param, Headers } from '@nestjs/common';

import { ItemService } from './items.service';
import { AuthService } from '../auth/auth.service';

@Controller('item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly authService: AuthService,
  ) {}

  // GET distributor info
  @Get(':iid')
  async getSales(
    @Param('iid') iid: string,
    @Headers('authorization') authHeader: string,
  ) {
    const verify = await this.authService.verifyUser(authHeader);
    if (!verify.auth) {
      return { ...verify };
    }
    return await this.itemService.getItemCost(iid);
  }
}
