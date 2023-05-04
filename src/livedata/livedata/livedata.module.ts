import { Module } from '@nestjs/common';
import { CronjobsService } from '../cronjobs/cronjobs.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [],
    providers: [CronjobsService],
    exports: [CronjobsService],
    
    })
export class LivedataModule {
   
}
