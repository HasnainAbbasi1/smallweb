import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BrowserState,
  BrowserStateSchema,
} from './schemas/browser-state.schema';

import { Person, PersonSchema } from '../people/schemas/person.schema';
import { Site, SiteSchema } from '../sites/schemas/sites.schema';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrowserState.name, schema: BrowserStateSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}