import { Controller, Body, Get, Param, Headers } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async getSales(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSales(start, end, authHeader);
  }

  @Get('cust/:cid')
  async getSalesByCust(
    @Param('cid') cid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSalesByCust(start, end, cid, authHeader);
  }

  @Get('item/:iid')
  async getSalesByItem(
    @Param('iid') iid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSalesByItem(start, end, iid, authHeader);
  }

  @Get('summary/cust/:cid')
  async getSummaryByCust(
    @Param('cid') cid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSummaryByCust(
      start,
      end,
      cid,
      authHeader,
    );
  }

  @Get('summary/item/:iid')
  async getSummaryByItem(
    @Param('iid') iid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSummaryByItem(
      start,
      end,
      iid,
      authHeader,
    );
  }

  @Get('distinct/cust')
  async getDistinctCustomers(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getDistinctCustomers(start, end, authHeader);
  }

  @Get('distinct/item')
  async getDistinctItems(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getDistinctItems(start, end, authHeader);
  }
}
