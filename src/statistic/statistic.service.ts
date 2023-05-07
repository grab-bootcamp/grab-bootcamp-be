import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { INTERVAL_HOUR_SCRAPING } from './entities';
import { Statistic } from '@prisma/client';

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

  getStatistic(mForestId: number, fromDate: Date, toDate: Date) {
    return this.prisma.statistic.findMany({
      where: {
        mForestId,
        mCreatedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
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

  async updateRealtimeWeatherData(data: Omit<Statistic, 'mId'>[]) {
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
