import { Controller, Logger, Patch } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { StatisticService } from 'src/statistic/statistic.service';
import { FwiService } from 'src/fwi/fwi.service';
import { DEFAULT_FWI_CONSTANTS } from 'src/fwi/fwi.default';
import { CrawlerStatus } from './types';

@Controller('crawler')
export class CrawlerController {
  private readonly logger: Logger = new Logger(CrawlerController.name);
  
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly statisticService: StatisticService,
    private readonly fwiService: FwiService,
    ) { }

  @Cron('*/5 * * * * *', {
    name: 'historical-statistics',
  })
  async historicalStatistics() {
    const record = await this.crawlerService.getNextRecordToCrawl();
    try {
      // No more records to crawl
      if (!record) {
        const job = this.schedulerRegistry.getCronJob('historical-statistics');
        this.logger.log(' No more records to crawl');

        job.stop();
        return;
      }

      const rawData = await this.crawlerService.getData(record.mUrl);

      const observations = this.crawlerService._transformCrawledHistoryData(rawData);
      const theDayBefore = new Date(observations[0].mCreatedAt);
      theDayBefore.setDate(theDayBefore.getDate() - 1);
      theDayBefore.setHours(0, 0, 0, 0);

      const fwiData = await this.statisticService.getStatistic(
        record.mForestId,
        theDayBefore,
        observations[0].mCreatedAt,
        null, 100
      );

      const lastFwiData = fwiData.length > 0 ? {
        Fo: fwiData[0].mFFMC,
        Po: fwiData[0].mDMC,
        Do: fwiData[0].mDC,
      } : {
        Fo: DEFAULT_FWI_CONSTANTS.FFMC,
        Po: DEFAULT_FWI_CONSTANTS.DMC,
        Do: DEFAULT_FWI_CONSTANTS.DC,
      };

      const payloads = observations.map(observation => {

        const { mFFMC, mDMC, mDC, mISI, mBUI, mFWI } = this.fwiService._mainCalculation(
          observation.humidity,
          observation.temerature,
          observation.windSpeed,
          observation.rainFall,
          lastFwiData,
          observation.mCreatedAt.getMonth()
        )

        lastFwiData.Fo = mFFMC;
        lastFwiData.Po = mDMC;
        lastFwiData.Do = mDC;

        return {
          mFFMC,
          mDMC,
          mDC,
          mISI,
          mBUI,
          mFWI,
          mHumidity: observation.humidity,
          mWindSpeed: observation.windSpeed,
          mTemperature: observation.temerature,
          mRainfall: observation.rainFall,
          mRawData: observation.rawData,
          mCreatedAt: observation.mCreatedAt,
          mForestId: record.mForestId,
          mCondition: observation.condition,
        }
      })

      await this.statisticService.updateRealtimeWeatherData(
        payloads
      )

      await this.crawlerService.updateCrawlerStatus(record.mId, CrawlerStatus.FINISHED);
    } catch (error) {
      console.error('error: ', error);
      await this.crawlerService.updateCrawlerStatus(record.mId, CrawlerStatus.FAILED);
    }
  }

  @Patch()
  toggleCrawler() {
    const job = this.schedulerRegistry.getCronJob('historical-statistics');
    if (job.running) {
      job.stop();
    } else {
      job.start();
    }
  }
}
