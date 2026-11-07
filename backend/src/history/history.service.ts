import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  BrowserState,
  BrowserStateDocument,
} from './schemas/browser-state.schema';

import { Person } from '../people/schemas/person.schema';
import { Site } from '../sites/schemas/sites.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(BrowserState.name)
    private readonly browserStateModel: Model<BrowserStateDocument>,

    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,

    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,
  ) {}

  // Get or create browser state for a person
  private async getOrCreateState(personId: string) {
    if (!Types.ObjectId.isValid(personId)) {
      throw new BadRequestException('Invalid person ID');
    }

    const personExists = await this.personModel.exists({
      _id: personId,
    });

    if (!personExists) {
      throw new NotFoundException('Person not found');
    }

    return this.browserStateModel.findOneAndUpdate(
      { personId: new Types.ObjectId(personId) },
      { $setOnInsert: { personId: new Types.ObjectId(personId) } },
      { upsert: true, new: true },
    );
  }

  // Navigate to a website
  async navigate(personId: string, address: string) {
    const normalizedAddress = address.trim().toLowerCase();

    const site = await this.siteModel.findOne({
      address: normalizedAddress,
    });

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    const state = await this.getOrCreateState(personId);

    // Remove forward history when navigating to a new page
    state.entries = state.entries.slice(0, state.currentIndex + 1) as any;

    // Add new visit
    state.entries.push({
      siteId: site._id,
      address: site.address,
      visitedAt: new Date(),
      scrollY: 0,
    } as any);

    state.currentIndex = state.entries.length - 1;

    await state.save();

    return {
      message: 'Navigation successful',
      currentIndex: state.currentIndex,
      currentPage: site,
      history: state.entries,
    };
  }

  // Go back
  async goBack(personId: string) {
    const state = await this.getOrCreateState(personId);

    if (state.currentIndex <= 0) {
      throw new BadRequestException('No previous page available');
    }

    state.currentIndex -= 1;
    await state.save();

    const entry = state.entries[state.currentIndex];
    const site = await this.siteModel.findById(entry.siteId);

    if (!site) {
      throw new NotFoundException('Website no longer exists');
    }

    return {
      currentIndex: state.currentIndex,
      currentPage: site,
      scrollY: entry.scrollY,
    };
  }

  // Go forward
  async goForward(personId: string) {
    const state = await this.getOrCreateState(personId);

    if (state.currentIndex >= state.entries.length - 1) {
      throw new BadRequestException('No next page available');
    }

    state.currentIndex += 1;
    await state.save();

    const entry = state.entries[state.currentIndex];
    const site = await this.siteModel.findById(entry.siteId);

    if (!site) {
      throw new NotFoundException('Website no longer exists');
    }

    return {
      currentIndex: state.currentIndex,
      currentPage: site,
      scrollY: entry.scrollY,
    };
  }

  // Get browsing history
  async getHistory(personId: string) {
    const state = await this.getOrCreateState(personId);

    return {
      entries: state.entries,
      currentIndex: state.currentIndex,
    };
  }

  // Update scroll position of current page
  async updateScroll(personId: string, scrollY: number) {
    if (!Number.isFinite(scrollY) || scrollY < 0) {
      throw new BadRequestException('Invalid scroll position');
    }

    const state = await this.getOrCreateState(personId);

    if (state.currentIndex < 0) {
      throw new BadRequestException('No page currently open');
    }

    state.entries[state.currentIndex].scrollY = scrollY;

    await state.save();

    return { message: 'Scroll position saved', scrollY };
  }
}