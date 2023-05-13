import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { HttpModule } from '@nestjs/axios';
import { CrawlerController } from './crawler.controller';
import { StatisticModule } from 'src/statistic/statistic.module';
import { FwiModule } from 'src/fwi/fwi.module';

@Module({
  imports: [
    HttpModule,
    StatisticModule,
    FwiModule
  ],
  providers: [CrawlerService],
  exports: [CrawlerService],
  controllers: [CrawlerController]
})
export class CrawlerModule {}
