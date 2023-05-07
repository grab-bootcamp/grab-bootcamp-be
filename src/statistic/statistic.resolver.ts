import { Args, GraphQLISODateTime, Query, Resolver } from '@nestjs/graphql';
import { StatisticService } from './statistic.service';
import { Statistic } from './entities';

@Resolver(() => Statistic)
export class StatisticResolver {
  constructor(private readonly statisticService: StatisticService) { }

  @Query(() => [Statistic], { name: 'statistic' })
  findAll(@Args('forestId') mForestId: number, @Args('fromDate', { type: () => GraphQLISODateTime }) fromDate: Date, @Args('toDate', { type: () => GraphQLISODateTime }) toDate: Date) {
    return this.statisticService.getStatistic(mForestId, new Date(fromDate), new Date(toDate));
  }
}
