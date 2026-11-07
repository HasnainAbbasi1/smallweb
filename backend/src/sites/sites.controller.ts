import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // GET /sites - Get all websites
  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  // GET /sites/:address - Get website by address
  @Get(':address')
  findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  // POST /sites - Publish a website
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