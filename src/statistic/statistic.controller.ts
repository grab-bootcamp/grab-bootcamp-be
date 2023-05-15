import { Controller, OnModuleInit } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Cron } from '@nestjs/schedule';
import { ForestService } from 'src/forest/forest.service';
import { FwiService } from 'src/fwi/fwi.service';
import { Forest } from '@prisma/client';
import { FwiForsestData, INTERVAL_HOUR_SCRAPING } from './entities';
import { DEFAULT_FWI_CONSTANTS } from 'src/fwi/fwi.default';

@Controller('statistic')
export class StatisticController implements OnModuleInit {
  constructor(
    private readonly forestService: ForestService,
    private readonly fwiService: FwiService,
    private readonly statisticService: StatisticService
  ) { }

  private forests: Array<Forest & FwiForsestData> = [];

  async onModuleInit() {
    await this._processForestData();
  }

  @Cron(`0 0 0-23/${INTERVAL_HOUR_SCRAPING} * * *`)
  async fetchLiveWeatherData() {
    const timeMark = this.statisticService._getLatestPastTimeMark();
    const fwiWeatherData = await Promise.all(this.forests.map(async (forest) => {
      const { lat, lng } = forest.mCoordinates as any;
      const { humidity, temperature, windSpeed, rainFall, condition, rawData } = await this.statisticService.getRealtimeWeatherData(lat, lng);
      const currentMonth = new Date().getMonth();

      const {
        mFFMC,
        mDMC,
        mDC,
        mISI,
        mBUI,
        mFWI,
      } = this.fwiService._mainCalculation(
        humidity,
        temperature,
        windSpeed,
        rainFall,
        forest,
        currentMonth
      );

      // Cache the data for later time mark calculation
      // Manipulate pointer to the forest object ;)
      forest.Po = mFFMC;
      forest.Fo = mDMC;
      forest.Do = mDC;

      return {
        mFFMC,
        mDMC,
        mDC,
        mISI,
        mBUI,
        mFWI,
        mHumidity: humidity,
        mWindSpeed: windSpeed,
        mTemperature: temperature,
        mRainfall: rainFall,
        mCondition: condition,
        mRawData: rawData,
        mCreatedAt: timeMark,
        mForestId: forest.mId,
      };
    }))

    await this.statisticService.updateRealtimeWeatherData(fwiWeatherData);
  }

  private async _processForestData() {
    const [forests, latestFwiData] = await Promise.all([
      this.forestService.findAll(),
      this.statisticService.getLatestStatistic()
    ]);

    this.forests = forests.map((forest) => {
      const data = latestFwiData.find((data) => data.mForestId === forest.mId);
      return {
        ...forest,
        Fo: data?.mFFMC ?? DEFAULT_FWI_CONSTANTS.FFMC,
        Do: data?.mDC ?? DEFAULT_FWI_CONSTANTS.DC,
        Po: data?.mDMC ?? DEFAULT_FWI_CONSTANTS.DMC,
      };
    });
  }
}
