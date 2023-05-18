import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Cron } from '@nestjs/schedule';
import { ForestService } from 'src/forest/forest.service';
import { FwiService } from 'src/fwi/fwi.service';
import { Forest } from '@prisma/client';
import { FwiForsestData, INTERVAL_HOUR_SCRAPING } from './entities';
import { DEFAULT_FWI_CONSTANTS } from 'src/fwi/fwi.default';
import { IPredictFireRiskPayload } from './interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailVariablesDto } from 'src/mail/dto';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto, NotificationSeverity, NotificationType } from 'src/notification/dto';

@Controller('statistic')
export class StatisticController implements OnModuleInit {
  constructor(
    private readonly forestService: ForestService,
    private readonly fwiService: FwiService,
    private readonly statisticService: StatisticService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
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

      const predictionFireRiskPayload: IPredictFireRiskPayload = {
        FFMC: mFFMC,
        DMC: mDMC,
        DC: mDC,
        ISI: mISI,
        BUI: mBUI,
        FWI: mFWI,
        temp: temperature,
        RH: humidity,
        wind: windSpeed,
        rain: rainFall,
      }

      const mFireRisk = await this.statisticService.getFireRiskPrediction(predictionFireRiskPayload);

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
        mFireRisk: Math.round(mFireRisk * 100),
        mForestId: forest.mId,
      };
    }))

    await this.statisticService.updateRealtimeWeatherData(fwiWeatherData);
    this._processNotification(fwiWeatherData);
  }

  @Post()
  async mockFetchLiveWeatherData(@Body() {
    forestId, temperature, humidity, windSpeed, rainFall, mFFMC, mDMC, mDC, mISI, mBUI, mFWI
  }: {
    forestId: number,
    temperature: number,
    humidity: number,
    windSpeed: number,
    rainFall: number,
    mFFMC: number,
    mDMC: number,
    mDC: number,
    mISI: number,
    mBUI: number,
    mFWI: number,
  }) {
    const predictionFireRiskPayload: IPredictFireRiskPayload = {
      FFMC: mFFMC,
      DMC: mDMC,
      DC: mDC,
      ISI: mISI,
      BUI: mBUI,
      FWI: mFWI,
      temp: temperature,
      RH: humidity,
      wind: windSpeed,
      rain: rainFall,
    }

    const mFireRisk = await this.statisticService.getFireRiskPrediction(predictionFireRiskPayload);

    this._processNotification([{
      mFireRisk: Math.max(1, Math.min(99, Math.round(mFireRisk * 100))),
      mForestId: forestId
    }]);
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

  private _processNotification(fireRiskPredictionData: { mForestId: number, mFireRisk: number }[]) {
    fireRiskPredictionData.forEach((data) => {
      const forest = this.forests.find((forest) => forest.mId === data.mForestId);

      const notificationDto: CreateNotificationDto = {
        mTitle: `Fire risk warning for forest ${forest.mName}`,
        mBody: `The fire risk of forest ${forest.mName} is ${data.mFireRisk}%, click to see more details`,
        mSeverity: NotificationSeverity.MODERATE,
        mType: NotificationType.WARNING,
        mForestId: forest.mId,
      }

      if (data.mFireRisk >= 90) {
        const payload: SendEmailVariablesDto = {
          subject: `${forest.mName} is in danger!`,
          title: `Fire risk warning for forest ${forest.mName}`,
          content: notificationDto.mBody,
          redirectUrl: this.configService.get('APP_URL') + `?forestId=${data.mForestId}`
        }

        this.eventEmitter.emit('mail.fanout', payload);

        notificationDto.mSeverity = NotificationSeverity.CRITICAL;
        notificationDto.mType = NotificationType.ALERT;
        this.eventEmitter.emit('notification.publish', notificationDto);
      } else if (data.mFireRisk >= 70) {
        this.eventEmitter.emit('notification.publish', notificationDto);
      }
    })
  }
}
