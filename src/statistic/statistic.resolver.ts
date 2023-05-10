import { Args, GraphQLISODateTime, Query, Resolver } from '@nestjs/graphql';
import { StatisticService } from './statistic.service';
import { Statistic } from './entities';

@Resolver(() => Statistic)
export class StatisticResolver {
  constructor(private readonly statisticService: StatisticService) { }

  @Query(() => [Statistic], { name: 'statistic' })
  findAll(
    @Args('forestId') mForestId: number,
    @Args('fromDate', { type: () => GraphQLISODateTime }) fromDate: Date,
    @Args('toDate', { type: () => GraphQLISODateTime }) toDate: Date,
    @Args('cursor', { nullable: true, defaultValue: null }) cursor: number,
    @Args('size', { defaultValue: 10 }) size: number,
  ) {
    return this.statisticService.getStatistic(mForestId, fromDate, toDate, cursor, size);
  }
}
