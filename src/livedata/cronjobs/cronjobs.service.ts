import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronjobsService {

 private readonly logger = new Logger(CronjobsService.name);

//  * * * * * = min h day month day(of week)
// * * * * * = once per minute
  @Cron('* * * * *')
  handleCron() {
    this.logger.debug('Call every 5 second');
    console.log('Call every 5 second');
  }

}
