
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeopleModule } from './people/people.module';  
import { SitesModule } from './sites/sites.module';
import { HistoryModule } from './history/history.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://127.0.0.1:27017/smallweb',
    ),
    PeopleModule,
    SitesModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
