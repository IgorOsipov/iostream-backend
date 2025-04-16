import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { GqlContext } from '@/src/shared/types/gql-context.types';

import { AuthModel } from '../account/models/auth.model';

import { VerificationInput } from './inputs/verification.input';
import { VerificationService } from './verification.service';

@Resolver('Verification')
export class VerificationResolver {
  public constructor(
    private readonly verificationService: VerificationService
  ) {}

  @Mutation(() => AuthModel, { name: 'verifyAccount' })
  public async verify(
    @Context() { req }: GqlContext,
    @Args('data') input: VerificationInput,
    @UserAgent() userAgent: string
  ) {
    return this.verificationService.verify(req, input, userAgent);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'sendVerificationToken' })
  public async sendVerificationToken(@Authorized() user: User) {
    return this.verificationService.sendVerificationToken(user);
  }
}
