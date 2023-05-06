import { Controller , Get, Req} from '@nestjs/common';
import { CronjobsService } from '../cronjobs/cronjobs.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('livedata')
export class LivedataController  {
    public data: object;
    constructor(
        private readonly cronjobService: CronjobsService
      ) { }

    @Get()
    returnData() : object
    {
        
        return this.data;
    }

    @Cron(CronExpression.EVERY_MINUTE)
    updateData()
    {
        
        this.data=this.cronjobService.fetchWholeData();
        
    }

}
