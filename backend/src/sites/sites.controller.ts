
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
  ) {}

  // Search must come before the dynamic address route
  @Get('search')
  search(@Query('q') query: string) {
    return this.sitesService.search(query);
  }

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':address')
  findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  create(
    @Body()
    body: {
      address: string;
      title: string;
      html: string;
      authorId: string;
    },
  ) {
    return this.sitesService.create(body);
  }
}
