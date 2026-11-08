
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { AppModule } from './app.module';

import { Person } from './people/schemas/person.schema';
import { Site } from './sites/schemas/sites.schema';
import { BrowserState } from './history/schemas/browser-state.schema';

const PEOPLE = [
  {
    id: '672000000000000000000001',
    name: 'Ayesha Khan',
  },
  {
    id: '672000000000000000000002',
    name: 'Omar Farooq',
  },
  {
    id: '672000000000000000000003',
    name: 'Sara Malik',
  },
];

const SITES = [
  {
    address: 'cityjournal',
    title: 'City Journal',
    author: 0,
    html: `<h1>City Journal</h1>
      <p>Welcome to City Journal, a publication about cities, communities and everyday life.</p>
      <h2>Building Better Communities</h2>
      <p>Urban communities grow stronger when residents participate in local projects.</p>
      <p>Read more about technology at <a href="techworld">Tech World</a>.</p>
      <p>Explore our <a href="greenliving">Green Living</a> section.</p>`,
  },
  {
    address: 'techworld',
    title: 'Tech World',
    author: 1,
    html: `<h1>Tech World</h1>
      <p>Technology is changing how people work, communicate and learn.</p>
      <h2>Artificial Intelligence</h2>
      <p>Artificial intelligence helps developers automate repetitive tasks.</p>
      <p>Visit <a href="codecorner">Code Corner</a> to learn programming.</p>
      <p>Read about science at <a href="sciencezone">Science Zone</a>.</p>`,
  },
  {
    address: 'codecorner',
    title: 'Code Corner',
    author: 1,
    html: `<h1>Code Corner</h1>
      <p>A place for programmers to learn software development.</p>
      <h2>Learning JavaScript</h2>
      <p>JavaScript is widely used for frontend and backend development.</p>
      <p>Explore <a href="techworld">Tech World</a>.</p>
      <p>Read our <a href="booknook">Book Nook</a> recommendations.</p>`,
  },
  {
    address: 'greenliving',
    title: 'Green Living',
    author: 2,
    html: `<h1>Green Living</h1>
      <p>Simple habits can help protect our environment.</p>
      <h2>Urban Gardens</h2>
      <p>Community gardens improve neighbourhood spaces and encourage sustainable living.</p>
      <p>Read <a href="cityjournal">City Journal</a>.</p>
      <p>Discover <a href="travelnotes">Travel Notes</a>.</p>`,
  },
  {
    address: 'historyhub',
    title: 'History Hub',
    author: 0,
    html: `<h1>History Hub</h1>
      <p>Explore historical events, cultures and important discoveries.</p>
      <h2>Ancient Civilizations</h2>
      <p>Ancient civilizations developed systems of writing, trade and architecture.</p>
      <p>Visit <a href="artspace">Art Space</a>.</p>`,
  },
  {
    address: 'foodstories',
    title: 'Food Stories',
    author: 2,
    html: `<h1>Food Stories</h1>
      <p>Discover recipes, ingredients and stories behind everyday meals.</p>
      <h2>Traditional Cooking</h2>
      <p>Traditional recipes often preserve family and cultural memories.</p>
      <p>Explore <a href="travelnotes">Travel Notes</a>.</p>`,
  },
  {
    address: 'sciencezone',
    title: 'Science Zone',
    author: 1,
    html: `<h1>Science Zone</h1>
      <p>Science helps us understand the natural world.</p>
      <h2>Space Exploration</h2>
      <p>Space research expands our understanding of planets and galaxies.</p>
      <p>Continue reading at <a href="techworld">Tech World</a>.</p>`,
  },
  {
    address: 'travelnotes',
    title: 'Travel Notes',
    author: 2,
    html: `<h1>Travel Notes</h1>
      <p>Travel introduces us to different cultures and places.</p>
      <h2>Exploring Northern Areas</h2>
      <p>Mountains, lakes and valleys attract visitors throughout the year.</p>
      <p>Read <a href="foodstories">Food Stories</a>.</p>`,
  },
  {
    address: 'artspace',
    title: 'Art Space',
    author: 0,
    html: `<h1>Art Space</h1>
      <p>Art allows people to express ideas and emotions creatively.</p>
      <h2>Modern Art</h2>
      <p>Modern artists experiment with materials, shapes and visual storytelling.</p>
      <p>Visit <a href="historyhub">History Hub</a>.</p>`,
  },
  {
    address: 'booknook',
    title: 'Book Nook',
    author: 1,
    html: `<h1>Book Nook</h1>
      <p>Discover books about technology, fiction, science and history.</p>
      <h2>Reading and Learning</h2>
      <p>Reading regularly develops knowledge and critical thinking.</p>
      <p>Explore <a href="historyhub">History Hub</a>.</p>
      <p>Try our broken link: <a href="missing-library">Missing Library</a>.</p>`,
  },
];

const TRAILS = [
  {
    person: 0,
    addresses: [
      'cityjournal',
      'techworld',
      'codecorner',
      'booknook',
      'historyhub',
      'artspace',
      'historyhub',
      'missing-library',
      'booknook',
      'techworld',
      'sciencezone',
      'cityjournal',
      'greenliving',
      'travelnotes',
      'foodstories',
      'cityjournal',
    ],
  },
  {
    person: 1,
    addresses: [
      'techworld',
      'sciencezone',
      'techworld',
      'codecorner',
      'booknook',
      'missing-blog',
      'booknook',
      'historyhub',
      'artspace',
      'historyhub',
      'cityjournal',
      'techworld',
      'codecorner',
      'sciencezone',
      'greenliving',
      'travelnotes',
    ],
  },
  {
    person: 2,
    addresses: [
      'greenliving',
      'travelnotes',
      'foodstories',
      'travelnotes',
      'cityjournal',
      'techworld',
      'sciencezone',
      'missing-archive',
      'historyhub',
      'artspace',
      'booknook',
      'foodstories',
      'greenliving',
      'cityjournal',
      'travelnotes',
      'foodstories',
    ],
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const personModel = app.get<Model<Person>>(
      getModelToken(Person.name),
    );

    const siteModel = app.get<Model<Site>>(
      getModelToken(Site.name),
    );

    const historyModel = app.get<Model<BrowserState>>(
      getModelToken(BrowserState.name),
    );

    console.log('Starting SmallWeb seed...');

    // Seed people with fixed IDs
    for (const person of PEOPLE) {
      await personModel.updateOne(
        { _id: new Types.ObjectId(person.id) },
        { $set: { name: person.name } },
        { upsert: true },
      );
    }

    console.log('People seeded.');

    // Seed websites
    for (const site of SITES) {
      await siteModel.updateOne(
        { address: site.address },
        {
          $set: {
            title: site.title,
            html: site.html,
            authorId: new Types.ObjectId(
              PEOPLE[site.author].id,
            ),
          },
        },
        { upsert: true },
      );
    }

    console.log('10 websites seeded.');

    // Build address-to-site-ID map
    const savedSites = await siteModel
      .find()
      .select('_id address')
      .lean();

    const siteMap = new Map(
      savedSites.map((site) => [
        site.address,
        site._id as Types.ObjectId,
      ]),
    );

    // Deterministic history starting time
    const startTime = new Date(
      '2026-11-07T09:00:00.000Z',
    );

    for (const trail of TRAILS) {
      const entries = trail.addresses.map(
        (address, index) => {
          const siteId = siteMap.get(address) ?? null;

          return {
            siteId,
            address,
            visitedAt: new Date(
              startTime.getTime() +
                index * 4 * 60 * 1000,
            ),
            scrollY:
              index % 3 === 0 ? 0 : index * 120,
            isBroken: !siteId,
          };
        },
      );

      await historyModel.updateOne(
        {
          personId: new Types.ObjectId(
            PEOPLE[trail.person].id,
          ),
        },
        {
          $set: {
            entries,
            currentIndex: entries.length - 1,
          },
        },
        { upsert: true },
      );
    }

    console.log('Browsing histories seeded.');
    console.log('Seed completed successfully.');
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
