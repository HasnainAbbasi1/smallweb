
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Site } from './schemas/sites.schema';
import { Person } from '../people/schemas/person.schema';

import { sanitizeWebsiteHtml } from './utils/html-sanitizer';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,

    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,
  ) {}

  // Get all published websites
  async findAll() {
    return this.siteModel
      .find()
      .select('-html')
      .lean();
  }

  // Search websites by title and HTML content
  async search(query: string) {
    if (typeof query !== 'string' || !query.trim()) {
      throw new BadRequestException('Search query is required');
    }

    const safeQuery = query.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const searchRegex = new RegExp(safeQuery, 'i');

    return this.siteModel
      .find({
        $or: [
          { title: searchRegex },
          { html: searchRegex },
        ],
      })
      .select('address title authorId createdAt')
      .limit(50)
      .lean();
  }

  // Get website by address
  async findByAddress(address: string) {
    if (!address || !address.trim()) {
      throw new BadRequestException('Address is required');
    }

    const site = await this.siteModel
      .findOne({
        address: address.toLowerCase().trim(),
      })
      .lean();

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    return site;
  }

  // Publish a new website
  async create(data: {
    address: string;
    title: string;
    html: string;
    authorId: string;
  }) {
    if (
      typeof data?.address !== 'string' ||
      typeof data?.title !== 'string' ||
      typeof data?.html !== 'string' ||
      typeof data?.authorId !== 'string'
    ) {
      throw new BadRequestException('Invalid publishing data');
    }

    const address = data.address.trim().toLowerCase();
    const title = data.title.trim();
    const html = sanitizeWebsiteHtml(data.html);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(address)) {
      throw new BadRequestException(
        'Address can only contain lowercase letters, numbers and hyphens',
      );
    }

    if (!title) {
      throw new BadRequestException('Website title is required');
    }

    if (!html) {
      throw new BadRequestException('Website HTML is required');
    }

    if (html.length > 100000) {
      throw new BadRequestException('HTML content is too large');
    }

    if (!Types.ObjectId.isValid(data.authorId)) {
      throw new BadRequestException('Invalid author ID');
    }

    const authorExists = await this.personModel.exists({
      _id: data.authorId,
    });

    if (!authorExists) {
      throw new NotFoundException('Author not found');
    }

    const existingSite = await this.siteModel.exists({ address });

    if (existingSite) {
      throw new ConflictException(
        'This website address is already taken',
      );
    }

    try {
      const site = await this.siteModel.create({
        address,
        title,
        html,
        authorId: new Types.ObjectId(data.authorId),
      });

      return {
        message: 'Website published successfully',
        site: {
          _id: site._id,
          address: site.address,
          title: site.title,
          authorId: site.authorId,
          createdAt: site.get('createdAt') as Date,
        },
      };
    } catch (error: any) {
      // Handle duplicate address if two requests arrive together
      if (error?.code === 11000) {
        throw new ConflictException(
          'This website address is already taken',
        );
      }

      throw error;
    }
  }
}
