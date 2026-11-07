import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // POST /history/:personId/navigate
  @Post(':personId/navigate')
  navigate(
    @Param('personId') personId: string,
    @Body() body: { address: string },
  ) {
    return this.historyService.navigate(personId, body.address);
  }

  // POST /history/:personId/back
  @Post(':personId/back')
  goBack(@Param('personId') personId: string) {
    return this.historyService.goBack(personId);
  }

  // POST /history/:personId/forward
  @Post(':personId/forward')
  goForward(@Param('personId') personId: string) {
    return this.historyService.goForward(personId);
  }

  // GET /history/:personId
  @Get(':personId')
  getHistory(@Param('personId') personId: string) {
    return this.historyService.getHistory(personId);
  }

  // PATCH /history/:personId/scroll
  @Patch(':personId/scroll')
  updateScroll(
    @Param('personId') personId: string,
    @Body() body: { scrollY: number },
  ) {
    return this.historyService.updateScroll(personId, body.scrollY);
  }
}