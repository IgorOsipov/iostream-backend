import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { CqlContext } from '@/src/shared/utils/types/gql-context.types';

import { UserModel } from '../account/models/user.model';

import { LoginInput } from './inputs/login.input';
import { SessionService } from './session.service';

@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => UserModel, { name: 'login' })
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
