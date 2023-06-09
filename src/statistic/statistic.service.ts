import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { INTERVAL_HOUR_SCRAPING } from './entities';
import { Statistic } from '@prisma/client';
import { IPredictFireRiskPayload } from './interface';

interface IRealtimeWeatherData {
  humidity: number;
  windSpeed: number;
  temperature: number;
  rainFall: number;
  condition: {
    text: string;
    icon: string;
    code: number;
  };
  rawData: any;
}

@Injectable()
export class StatisticService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  getStatistic(mForestId: number, fromDate: Date, toDate: Date, cursor: Date | null, size: number) {
    const onCursorArgs = {}
    if (cursor) {
      onCursorArgs['cursor'] = {
        mForestId_mCreatedAt: {
          mForestId,
          mCreatedAt: cursor,
        }
      }
      onCursorArgs['skip'] = 1
    }

    return this.prisma.statistic.findMany({
      where: {
        mForestId,
        mCreatedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        mForestId: true,
        mCreatedAt: true,
        mFFMC: true,
        mDMC: true,
        mDC: true,
        mISI: true,
        mBUI: true,
        mFWI: true,
        mFireRisk: true,
        mTemperature: true,
        mWindSpeed: true,
        mRainfall: true,
        mHumidity: true,
        mCondition: true,
      },
      ...onCursorArgs,
      take: size,
      orderBy: {
        mCreatedAt: 'desc',
      },
    });
  }

  async getRealtimeWeatherData(lat: number, lng: number): Promise<IRealtimeWeatherData> {
    const apiKey = this.configService.getOrThrow('WEATHER_API_KEY');
    const requestUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}`;
    const { data } = await this.httpService.axiosRef.get(requestUrl);
    return {
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      temperature: data.current.temp_c,
      rainFall: data.current.precip_mm,
      condition: data.current.condition,
      rawData: data,
    };
  }

  async updateRealtimeWeatherData(data: (Omit<Statistic, 'mId' | 'mFireRisk'> & Partial<Pick<Statistic, 'mFireRisk'>>)[]) {
    return this.prisma.statistic.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async getLatestStatistic() {
    return this.prisma.statistic.findMany({
      where: {
        mCreatedAt: {
          gte: this._getLatestPastTimeMark(),
        }
      },
    });
  }

  async getFireRiskPrediction(payload: IPredictFireRiskPayload) {
    const { data } = await this.httpService.axiosRef.get(
      `${this.configService.getOrThrow('PREDICTION_APP_URL')}/predict?${Object.entries(payload).map(([key, value]) => `${key}=${value}`).join('&')}`
    );
    return parseFloat(data);
  }

  _getLatestPastTimeMark() {
    const now = new Date();
    const hour = now.getHours();
    now.setHours(hour - (hour % INTERVAL_HOUR_SCRAPING));
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  }
}
