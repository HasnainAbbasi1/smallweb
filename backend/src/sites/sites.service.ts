import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Site } from './schemas/sites.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,
  ) {}

  // Get all published websites
  async findAll() {
    return this.siteModel.find().select('-html').lean();
  }

  // Get website by address
  async findByAddress(address: string) {
    const site = await this.siteModel
      .findOne({ address: address.toLowerCase().trim() })
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
    if (!Types.ObjectId.isValid(data.authorId)) {
      throw new BadRequestException('Invalid author ID');
    }

    return this.siteModel.create({
      address: data.address,
      title: data.title,
      html: data.html,
      authorId: new Types.ObjectId(data.authorId),
    });
  }
}