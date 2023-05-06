import { Module } from '@nestjs/common';
import { CronjobsService } from '../cronjobs/cronjobs.service';
import { HttpModule } from '@nestjs/axios';
import { LivedataController } from './livedata.controller';

@Module({
    imports: [ HttpModule],
    controllers: [LivedataController],
    providers: [CronjobsService],
    exports: [CronjobsService],
    })
export class LivedataModule {
   
    
}
