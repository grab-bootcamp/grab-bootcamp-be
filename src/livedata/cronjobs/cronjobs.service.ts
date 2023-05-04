import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { catchError, map } from 'rxjs/operators';
import { DbService } from '../db/db.service';


@Injectable()
export class CronjobsService {
  constructor(private readonly httpService: HttpService, private dbservice: DbService) {}
  
  private readonly logger = new Logger(CronjobsService.name);
  private readonly forests = new Array;
  // private readonly API_keys=['30f7f09560144876a51105253230305'];

  // fetch Forests cooordinates from MySQL database
  async onModuleInit() {
    const value = await this.dbservice.getAllForest(); 
    for(let i=0; i< value.length; i++)
    {
      this.forests[i]=value[i].mCoordinates;
      
    }
  }

  // fetch data weather API
  fetchLiveData(keys,lat,lng){
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

 
  @Cron(CronExpression.EVERY_MINUTE)
   // push to MySQL database
  pushToDatabase(){
    for (let i=0; i< this.forests.length;i++)
    {
       this.fetchLiveData('30f7f09560144876a51105253230305',this.forests[i].lng,this.forests[i].lat).subscribe(val =>{
       console.log(val);
      })
    }
  
  }
   
  @Timeout(50000)
  handleTimeout() {
  this.logger.debug('Timeout after 5 minutes');
  }

}
