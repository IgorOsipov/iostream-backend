import { ConflictException, Injectable } from '@nestjs/common';
import { Upload } from 'graphql-upload-ts';
import * as sharp from 'sharp';

import { User } from '@/prisma/generated';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../libs/storage/storage.service';

import { ChangeProfileInfoInput } from './inputs/change-info.input';
import {
  SocialLinkInput,
  SocialLinkOrderInput
} from './inputs/social-link.input';

@Injectable()
export class ProfileService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService
  ) {}

  public async changeAvatar(user: User, { file }: Upload) {
    if (!file) {
      throw new Error('File is required');
    }

    if (user.avatar) {
      await this.storageService.remove(user.avatar);
    }
    const chuncks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chuncks.push(Buffer.from(chunk as ArrayBufferLike));
    }

    const buffer = Buffer.concat(chuncks);

    const fileName = `/chanels/${user.username}.webp`;

    const processedBuffer = await sharp(buffer, {
      animated: file.fieldName?.endsWith('.gif') ? true : false
    })
      .resize(512, 512)
      .webp()
      .toBuffer();

    await this.storageService.uploadFile(
      processedBuffer,
      fileName,
      'image/webp'
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar: fileName }
    });

    return true;
  }

  public async removeAvatar(user: User) {
    if (!user.avatar) {
      return;
    }
    await this.storageService.remove(user.avatar);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar: null }
    });

    return true;
  }

  public async changeInfo(user: User, input: ChangeProfileInfoInput) {
    const { displayName, bio, username } = input;

    const isUsernameExists = await this.prismaService.user.findUnique({
      where: { username }
    });

    if (isUsernameExists && username !== user.username) {
      throw new ConflictException('Username already exists');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { displayName, bio, username }
    });

    return true;
  }

  public async findSocialLinks(user: User) {
    const socialLinks = await this.prismaService.socialLink.findMany({
      where: { userId: user.id },
      orderBy: { position: 'asc' }
    });
    return socialLinks;
  }

  public async createSocialLink(user: User, input: SocialLinkInput) {
    const { title, url } = input;

    const lastSocialLink = await this.prismaService.socialLink.findFirst({
      where: { userId: user.id },
      orderBy: { position: 'desc' }
    });

    const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1;

    await this.prismaService.socialLink.create({
      data: {
        title,
        url,
        position: newPosition,
        user: { connect: { id: user.id } }
      }
    });

    return true;
  }

  public async reorderSocialLinks(list: SocialLinkOrderInput[]) {
    if (!list.length) {
      return;
    }

    const updatePromises = list.map(socialLink => {
      return this.prismaService.socialLink.update({
        where: { id: socialLink.id },
        data: { position: socialLink.position }
      });
    });

    await Promise.all(updatePromises);

    return true;
  }

  public async updateSocialLink(id: string, input: SocialLinkInput) {
    const { title, url } = input;

    await this.prismaService.socialLink.update({
      where: { id },
      data: {
        title,
        url
      }
    });

    return true;
  }

  public async removeSocialLink(id: string) {
    await this.prismaService.socialLink.delete({
      where: { id }
    });

    return true;
  }
}
