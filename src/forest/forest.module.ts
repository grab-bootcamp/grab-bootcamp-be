import { Module } from '@nestjs/common';
import { ForestService } from './forest.service';
import { ForestResolver } from './forest.resolver';

@Module({
  providers: [ForestResolver, ForestService],
  exports: [ForestService]
})
export class ForestModule {}
