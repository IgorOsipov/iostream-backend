import { Args, Query, Resolver } from '@nestjs/graphql';

import { FiltersInput } from './inputs/filters.input';
import { StreamModel } from './models/stream.model';
import { StreamService } from './stream.service';

@Resolver('Stream')
export class StreamResolver {
  public constructor(private readonly streamService: StreamService) {}

  @Query(() => [StreamModel], { name: 'findAllStreams' })
  public async findAll(@Args('filters') input: FiltersInput) {
    return this.streamService.findAll(input);
  }
}
