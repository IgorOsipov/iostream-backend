import { Injectable } from '@nestjs/common';
import { Upload } from 'graphql-upload-ts';
import * as sharp from 'sharp';

import { User } from '@/prisma/generated';

import { PrismaService } from '../core/prisma/prisma.service';
import { StorageService } from '../modules/libs/storage/storage.service';

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

    if (file.fieldName && file.fieldName.endsWith('.gif')) {
      const processedBuffer = await sharp(buffer, { animated: true })
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storageService.uploadFile(
        processedBuffer,
        fileName,
        'image/webp'
      );
    } else {
      const processedBuffer = await sharp(buffer)
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storageService.uploadFile(
        processedBuffer,
        fileName,
        'image/webp'
      );
    }

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
}
