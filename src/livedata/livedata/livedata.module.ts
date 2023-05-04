import { Module } from '@nestjs/common';
import { CronjobsService } from '../cronjobs/cronjobs.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { DbService } from '../db/db.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DbModule } from '../db/db.module';

@Module({
    imports: [ HttpModule,DbModule],
    controllers: [],
    providers: [CronjobsService, DbService],
    exports: [CronjobsService],
    })
export class LivedataModule {
   
}
