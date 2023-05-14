import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticResolver } from './statistic.resolver';
import { StatisticController } from './statistic.controller';
import { FwiModule } from 'src/fwi/fwi.module';
import { ForestModule } from 'src/forest/forest.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    FwiModule,
    ForestModule,
  ],
  providers: [StatisticResolver, StatisticService],
  controllers: [StatisticController],
  exports: [StatisticService],
})
export class StatisticModule { }
