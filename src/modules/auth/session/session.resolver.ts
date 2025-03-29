import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { CqlContext } from '@/src/shared/types/gql-context.types';

import { LoginInput } from './inputs/login.input';
import { LoginModel } from './models/login.model';
import { SessionService } from './session.service';

@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => LoginModel, { name: 'login' })
  public async login(
    @Context() { req }: CqlContext,
    @Args('input') input: LoginInput
  ) {
    return this.sessionService.login(req, input);
  }

  @Mutation(() => Boolean, { name: 'logout' })
  public async logout(@Context() { req }: CqlContext) {
    return this.sessionService.logout(req);
  }
}
