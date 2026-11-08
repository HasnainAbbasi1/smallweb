
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

    const state = await this.browserStateModel.findOneAndUpdate(
      { personId: new Types.ObjectId(personId) },
      {
        $setOnInsert: {
          personId: new Types.ObjectId(personId),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return state;
  }

  // Navigate to a website, including broken addresses
  async navigate(personId: string, address: string) {
    if (typeof address !== 'string' || !address.trim()) {
      throw new BadRequestException('Address is required');
    }

    const normalizedAddress = address.trim().toLowerCase();

    const state = await this.getOrCreateState(personId);

    const site = await this.siteModel.findOne({
      address: normalizedAddress,
    });

    // Remove forward history after a new navigation
    state.entries.splice(state.currentIndex + 1);

    // Save the visit even if the website does not exist
    state.entries.push({
      siteId: site?._id ?? null,
      address: normalizedAddress,
      visitedAt: new Date(),
      scrollY: 0,
      isBroken: !site,
    } as any);

    state.currentIndex = state.entries.length - 1;

    await state.save();

    return {
      message: site
        ? 'Navigation successful'
        : 'Website not found. Address saved in history.',
      currentIndex: state.currentIndex,
      currentPage: site,
      isBroken: !site,
      history: state.entries,
    };
  }

  // Go back to the previous page
  async goBack(personId: string) {
    const state = await this.getOrCreateState(personId);

    if (state.currentIndex <= 0) {
      throw new BadRequestException(
        'No previous page available',
      );
    }

    state.currentIndex -= 1;

    await state.save();

    const entry = state.entries[state.currentIndex];

    const site = entry.siteId
      ? await this.siteModel.findById(entry.siteId)
      : null;

    return {
      currentIndex: state.currentIndex,
      currentPage: site,
      address: entry.address,
      scrollY: entry.scrollY,
      isBroken: !site,
    };
  }

  // Go forward to the next page
  async goForward(personId: string) {
    const state = await this.getOrCreateState(personId);

    if (state.currentIndex >= state.entries.length - 1) {
      throw new BadRequestException(
        'No next page available',
      );
    }

    state.currentIndex += 1;

    await state.save();

    const entry = state.entries[state.currentIndex];

    const site = entry.siteId
      ? await this.siteModel.findById(entry.siteId)
      : null;

    return {
      currentIndex: state.currentIndex,
      currentPage: site,
      address: entry.address,
      scrollY: entry.scrollY,
      isBroken: !site,
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

  // Update scroll position of the current page
  async updateScroll(personId: string, scrollY: number) {
    if (
      typeof scrollY !== 'number' ||
      !Number.isFinite(scrollY) ||
      scrollY < 0
    ) {
      throw new BadRequestException(
        'Invalid scroll position',
      );
    }

    const state = await this.getOrCreateState(personId);

    if (state.currentIndex < 0) {
      throw new BadRequestException(
        'No page currently open',
      );
    }

    state.entries[state.currentIndex].scrollY = scrollY;

    await state.save();

    return {
      message: 'Scroll position saved',
      scrollY,
    };
  }
}
