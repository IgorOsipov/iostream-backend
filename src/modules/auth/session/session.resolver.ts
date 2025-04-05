import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
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
    @Args('input') input: LoginInput,
    @UserAgent() userAgent: string
  ) {
    return this.sessionService.login(req, input, userAgent);
  }

  @Mutation(() => Boolean, { name: 'logout' })
  public async logout(@Context() { req }: CqlContext) {
    return this.sessionService.logout(req);
  }
}
