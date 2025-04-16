import { Injectable, NotFoundException } from '@nestjs/common';
import { Upload } from 'graphql-upload-ts';
import * as sharp from 'sharp';

import type { Prisma, User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { StorageService } from '../libs/storage/storage.service';

import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import { FiltersInput } from './inputs/filters.input';

@Injectable()
export class StreamService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService
  ) {}

  public async findAll(input: FiltersInput = {}) {
    const { take, skip, searchTerm } = input;

    const whereClause = searchTerm
      ? this.findBySearchTermFilter(searchTerm)
      : undefined;

    const streams = await this.prismaService.stream.findMany({
      take: take ?? 12,
      skip: skip ?? 0,
      where: {
        user: { isDeactivated: false },
        ...whereClause
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return streams;
  }

  public async findRandom() {
    const total = await this.prismaService.stream.count({
      where: {
        user: { isDeactivated: false }
      }
    });

    const randomIndexes = new Set<number>();
    while (randomIndexes.size < (total > 4 ? 4 : total)) {
      const randomIndex = Math.floor(Math.random() * total);
      randomIndexes.add(randomIndex);
    }

    const streams = await this.prismaService.stream.findMany({
      where: {
        user: { isDeactivated: false }
      },
      include: {
        user: true
      },
      skip: 0,
      take: total
    });

    return Array.from(randomIndexes).map(index => streams[index]);
  }

  public async changeInfo(user: User, input: ChangeStreamInfoInput) {
    const { title } = input;
    await this.prismaService.stream.update({
      where: {
        userId: user.id
      },
      data: { title }
    });

    return true;
  }

  public async changeThumbnail(user: User, { file }: Upload) {
    const stream = await this.findByUserId(user);

    if (!file) {
      throw new Error('File is required');
    }

    if (stream.thumbnailUrl) {
      await this.storageService.remove(stream.thumbnailUrl);
    }
    const chuncks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chuncks.push(Buffer.from(chunk as ArrayBufferLike));
    }

    const buffer = Buffer.concat(chuncks);

    const fileName = `/streams/${user.username}.webp`;

    const processedBuffer = await sharp(buffer, {
      animated: file.fieldName?.endsWith('.gif') ? true : false
    })
      .resize(1280, 720)
      .webp()
      .toBuffer();

    await this.storageService.uploadFile(
      processedBuffer,
      fileName,
      'image/webp'
    );

    await this.prismaService.stream.update({
      where: { id: user.id },
      data: { thumbnailUrl: fileName }
    });

    return true;
  }

  public async removeThumbnail(user: User) {
    const stream = await this.findByUserId(user);

    if (stream.thumbnailUrl) {
      await this.storageService.remove(stream.thumbnailUrl);
      await this.prismaService.stream.update({
        where: { id: user.id },
        data: { thumbnailUrl: null }
      });
    }

    return true;
  }

  private async findByUserId(user: User) {
    const stream = await this.prismaService.stream.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  private findBySearchTermFilter(searchTerm: string): Prisma.StreamWhereInput {
    return {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          user: {
            username: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        }
      ]
    };
  }
}
