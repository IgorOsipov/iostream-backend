import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLUpload, Upload } from 'graphql-upload-ts';

import { User } from '@/prisma/generated';

import { Authorization } from '../shared/decorators/auth.decorator';
import { Authorized } from '../shared/decorators/authorized.decorator';
import { FileValidationPipe } from '../shared/pipes/file-validation.pipe';

import { ChangeProfileInfoInput } from './inputs/change-info.input';
import {
  SocialLinkInput,
  SocialLinkOrderInput
} from './inputs/social-link.input';
import { SocialLinkModel } from './models/social-link.model';
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

  @Authorization()
  @Query(() => [SocialLinkModel], { name: 'findSocialLinks' })
  public async findSocialLinks(@Authorized() user: User) {
    return this.profileService.findSocialLinks(user);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'createSocialLink' })
  public async createSocialLink(
    @Authorized() user: User,
    @Args('data') input: SocialLinkInput
  ) {
    return this.profileService.createSocialLink(user, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'reorderSocialLinks' })
  public async reorderSocialLinks(
    @Args('list', { type: () => [SocialLinkOrderInput] })
    list: SocialLinkOrderInput[]
  ) {
    return this.profileService.reorderSocialLinks(list);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'updateSocialLink' })
  public async updateSocialLink(
    @Args('id') id: string,
    @Args('data') input: SocialLinkInput
  ) {
    return this.profileService.updateSocialLink(id, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeSocialLink' })
  public async removeSocialLink(@Args('id') id: string) {
    return this.profileService.removeSocialLink(id);
  }
}
