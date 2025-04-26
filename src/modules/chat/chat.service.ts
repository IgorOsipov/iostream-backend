import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { SendMessageInput } from './inputs/send-message.input';

@Injectable()
export class ChatService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findMessagesByStream(streamId: string) {
    const messages = await this.prismaService.chatMessage.findMany({
      where: {
        streamId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    return messages;
  }

  public async sendMessage(
    userId: string,
    streamId: string,
    input: SendMessageInput
  ) {
    const { text } = input;
    const stream = await this.prismaService.stream.findUnique({
      where: {
        id: streamId
      }
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (!stream.isLive) {
      throw new BadRequestException('Stream offline');
    }

    await this.prismaService.chatMessage.create({
      data: {
        text,
        user: { connect: { id: userId } },
        stream: { connect: { id: streamId } }
      }
    });

    return true;
  }
}
