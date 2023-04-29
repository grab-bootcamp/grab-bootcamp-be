import { Module } from '@nestjs/common';
import { ForestService } from './forest.service';
import { ForestResolver } from './forest.resolver';

@Module({
  providers: [ForestResolver, ForestService]
})
export class ForestModule {}
