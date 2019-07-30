import { Controller, Body, Get, Param, Headers } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // GET list of sales for date range
  @Get()
  async getSales(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSales(start, end, authHeader);
  }

  // GET list of sales for specific customer id (cid) or group by date range
  // split group by "-" eg) 1300-9988
  @Get('cust/:cid')
  async getSalesByCust(
    @Param('cid') cid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSalesByCust(start, end, cid, authHeader);
  }

  //GET list of sales for specific item id (iid) or group by date range
  // split group by "-" eg) 298-723
  @Get('item/:iid')
  async getSalesByItem(
    @Param('iid') iid: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getSalesByItem(start, end, iid, authHeader);
  }

  //GET summarized detail for customer by cid
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

  //GET summarized detail for item by iid
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

  //GET list of distinct customers in a date range
  @Get('distinct/cust')
  async getDistinctCustomers(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getDistinctCustomers(start, end, authHeader);
  }

  //GET list of distinct items in a date range
  @Get('distinct/item')
  async getDistinctItems(
    @Body('start') start: string,
    @Body('end') end: string,
    @Headers('authorization') authHeader: any,
  ) {
    return await this.salesService.getDistinctItems(start, end, authHeader);
  }
}
