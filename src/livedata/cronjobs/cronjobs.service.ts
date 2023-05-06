import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { catchError, map, take } from 'rxjs/operators';
import { Forest} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { env } from 'process';

@Injectable()
export class CronjobsService {
  constructor(private readonly httpService: HttpService, private prismaService: PrismaService) {}
  
  private readonly logger = new Logger(CronjobsService.name);
  private readonly forests = new Array;
  public data;

  // fetch Forests cooordinates from MySQL database
  async onModuleInit() {
   // const value = await this.dbservice.getAllForest(); 
   const value = await this.prismaService.forest.findMany();
    for(let i=0; i< value.length; i++)
    {
      this.forests[i]=value[i].mCoordinates;  
    }
  }

  // fetch data weather API
  fetchAPI(lat,lng){
    const keys= process.env.API_KEYS;
    const url=`http://api.weatherapi.com/v1/current.json?key= ${keys} &q= ${lng}, ${lat}`;
    const response = this.httpService
    .get(url)
    .pipe(
      map((response) => response.data),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
     );
   return response;
  }

  pushToDb(data: object)
  {
    
    
  }

  async fetchWholeData() : Promise<object> 
  {
     
    for (let i=0; i< this.forests.length;i++)
    {
    
      this.fetchAPI(this.forests[i].lng,this.forests[i].lat).subscribe(val => {
      this.data=val;
      this.pushToDb(this.data);
      });
        
     
    }
     return this.data;
    
  }
   
  @Timeout(50000)
  handleTimeout() {
  this.logger.debug('Timeout after 5 minutes');
  }

}
