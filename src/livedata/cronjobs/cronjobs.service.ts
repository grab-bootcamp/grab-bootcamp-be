import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { response } from 'express';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class CronjobsService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(CronjobsService.name);
  // private readonly API_keys=['30f7f09560144876a51105253230305'];


  // fetch weather API
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
    this.fetchLiveData('30f7f09560144876a51105253230305','-6.8','41.88').subscribe(val =>{
      console.log(val)
    })
  }
   
  @Timeout(50000)
  handleTimeout() {
  this.logger.debug('Timeout after 5 minutes');
  }

}
