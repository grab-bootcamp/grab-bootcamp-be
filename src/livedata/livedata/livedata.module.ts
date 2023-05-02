import { Module } from '@nestjs/common';
import { CronjobsService } from '../cronjobs/cronjobs.service';

@Module({
    controllers: [],
    providers: [CronjobsService],
    exports: [CronjobsService],
    
    })
export class LivedataModule {
   
}
