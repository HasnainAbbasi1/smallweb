import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  findAll() {
    return this.peopleService.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    if (typeof body?.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException('Name is required');
    }

    return this.peopleService.create(body.name.trim());
  }
}