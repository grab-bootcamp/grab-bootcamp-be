import { Resolver, Query } from '@nestjs/graphql';
import { ForestService } from './forest.service';
import { Forest } from './entities/forest.entity';

@Resolver(() => Forest)
export class ForestResolver {
  constructor(private readonly forestService: ForestService) { }
  @Query(() => [Forest], { name: 'forest' })
  findAll() {
    return this.forestService.findAll();
  }
}
