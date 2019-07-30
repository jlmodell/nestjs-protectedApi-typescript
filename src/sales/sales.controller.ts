import { Controller, Body, Get, Param } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async getSales(@Body('start') start: string, @Body('end') end: string) {
    return await this.salesService.getSales(start, end);
  }

  @Get('cust/:cid')
  async getSalesByCust(
    @Param('cid') cid: string,
    @Body('start') start: string,
    @Body('end') end: string,
  ) {
    return await this.salesService.getSalesByCust(start, end, cid);
  }

  @Get('item/:iid')
  async getSalesByItem(
    @Param('iid') iid: string,
    @Body('start') start: string,
    @Body('end') end: string,
  ) {
    return await this.salesService.getSalesByItem(start, end, iid);
  }

  @Get('summary/cust/:cid')
  async getSummaryByCust(
    @Param('cid') cid: string,
    @Body('start') start: string,
    @Body('end') end: string,
  ) {
    return await this.salesService.getSummaryByCust(start, end, cid);
  }

  @Get('summary/item/:iid')
  async getSummaryByItem(
    @Param('iid') iid: string,
    @Body('start') start: string,
    @Body('end') end: string,
  ) {
    return await this.salesService.getSummaryByItem(start, end, iid);
  }
}
