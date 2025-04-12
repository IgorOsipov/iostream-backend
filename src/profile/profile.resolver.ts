import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLUpload, Upload } from 'graphql-upload-ts';

import { User } from '@/prisma/generated';

import { Authorization } from '../shared/decorators/auth.decorator';
import { Authorized } from '../shared/decorators/authorized.decorator';
import { FileValidationPipe } from '../shared/pipes/file-validation.pipe';

import { ChangeProfileInfoInput } from './inputs/change-info.input';
import { ProfileService } from './profile.service';

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeProfileAvatar' })
  public async changeAvatar(
    @Authorized() user: User,
    @Args('avatar', { type: () => GraphQLUpload }, FileValidationPipe)
    avatar: Upload
  ) {
    return this.profileService.changeAvatar(user, avatar);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeProfileAvatar' })
  public async removeAvatar(@Authorized() user: User) {
    return this.profileService.removeAvatar(user);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeProfileInfo' })
  public async changeInfo(
    @Authorized() user: User,
    @Args('data') input: ChangeProfileInfoInput
  ) {
    return this.profileService.changeInfo(user, input);
  }
}
