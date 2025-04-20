import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Upload } from 'graphql-upload-ts';
import { AccessToken } from 'livekit-server-sdk';
import * as sharp from 'sharp';

import type { Prisma, User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { StorageService } from '../libs/storage/storage.service';

import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import { FiltersInput } from './inputs/filters.input';
import { GenerateStreamTokenInput } from './inputs/generete-stream-token.input';

@Injectable()
export class StreamService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
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

  public async generateToken(input: GenerateStreamTokenInput) {
    const { userId, channelId } = input;

    let self: { id: string; username: string };

    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      self = { id: user.id, username: user.username };
    } else {
      self = {
        id: userId,
        username: `Viewer ${Math.floor(Math.random() * 100000)}`
      };
    }

    const channel = await this.prismaService.user.findUnique({
      where: {
        id: channelId
      }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const isHost = self.id === channel.id;

    const token = new AccessToken(
      this.configService.getOrThrow<string>('LIVE_API_KEY'),
      this.configService.getOrThrow<string>('LIVE_API_SECRET'),
      {
        identity: isHost ? `Host-${self.id}` : self.id.toString(),
        name: self.username
      }
    );

    token.addGrant({
      room: channel.id,
      roomJoin: true,
      canPublish: false
    });

    return { token: token.toJwt() };
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
