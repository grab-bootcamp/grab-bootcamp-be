import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrawlerStatus, IObservation } from './types';
import { HttpService } from '@nestjs/axios';

const INCH_TO_MM = 25.4;
const FAHRENHEIT_TO_CELSIUS = (f: number) => (f - 32) / 1.8;
const MPH_TO_KPH = 1.609344;

const ICON_MAP = {
  19: "//cdn.weatherapi.com/weather/64x64/day/296.png",
  26: "//cdn.weatherapi.com/weather/64x64/day/119.png",
  28: "//cdn.weatherapi.com/weather/64x64/day/119.png",
  30: "//cdn.weatherapi.com/weather/64x64/day/116.png",
  34: "//cdn.weatherapi.com/weather/64x64/day/113.png",
}

@Injectable()
export class CrawlerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) { }

  async getNextRecordToCrawl() {
    return this.prisma.$transaction(async tx => {
      const record = await tx.crawler.findFirst({
        where: {
          mStatus: CrawlerStatus.PENDING,
        },
        orderBy: {
          mCreatedAt: 'desc'
        },
        select: {
          mId: true,
          mUrl: true,
          mForestId: true,
        }
      });

      if (!record) {
        return null;
      }

      await tx.crawler.update({
        where: {
          mId: record.mId,
        },
        data: {
          mStatus: CrawlerStatus.RUNNING,
        }
      })

      return record;
    })
  }

  async updateCrawlerStatus(id: number, status: CrawlerStatus) {
    return this.prisma.crawler.update({
      where: {
        mId: id,
      },
      data: {
        mStatus: status,
      }
    })
  }

  async getData(url: string) {
    const { observations } = (await this.httpService.axiosRef.get(url)).data;
    return observations as IObservation[];
  }

  _transformCrawledHistoryData(data: IObservation[]) {
    const groupByDate = data.reduce((prev, current) => {
      const date = new Date(current.valid_time_gmt * 1000).getDate();
      if (!prev[date]) {
        prev[date] = [];
      }
      prev[date].push(current);

      return prev;
    }, {})

    return Object.keys(groupByDate).map(date => {
      const data = groupByDate[date];
      const total = data.reduce((prev, current) => {
        return {
          rh: prev.rh + current.rh,
          temp: prev.temp + current.temp,
          wspd: prev.wspd + current.wspd,
          precip_total: prev.precip_total + current.precip_total,
        }
      }, {
        rh: 0,
        temp: 0,
        wspd: 0,
        precip_total: 0,
      })

      return {
        humidity: total.rh / data.length,
        temerature: FAHRENHEIT_TO_CELSIUS(total.temp / data.length),
        windSpeed: total.wspd / data.length * MPH_TO_KPH,
        rainFall: total.precip_total * INCH_TO_MM,
        rawData: data,
        condition: {
          text: data[Math.round(data.length / 2)].wx_phrase,
          icon: ICON_MAP[data[Math.round(data.length / 2)].wx_icon] ?? data[Math.round(data.length / 2)].wx_icon,
          code: null,
        },
        mCreatedAt: new Date(data[Math.round(data.length / 2)].valid_time_gmt * 1000),
      }
    })
  }
}
