import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schemas/person.schema';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

async findAll() {
    return this.personModel
      .find()
      .select('name createdAt')
      .lean();
  }

  // Create a person
  async create(name: string) {
    const person = await this.personModel.create({ name });

    return {
      _id: person._id,
      name: person.name,
      createdAt: person.get('createdAt') as Date,
    };
  }
}