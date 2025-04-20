import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateIngressOptions,
  IngressAudioEncodingPreset,
  IngressInput,
  IngressVideoEncodingPreset
} from 'livekit-server-sdk';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { LiveKitService } from '../../libs/live-kit/live-kit.service';

@Injectable()
export class IngressService {
  public constructor(
    private readonly liveKitService: LiveKitService,
    private readonly prismaService: PrismaService
  ) {}

  public async create(user: User, ingressType: IngressInput) {
    await this.resetIngresses(user);

    const options: CreateIngressOptions = {
      name: user.username,
      roomName: user.id,
      participantName: user.username,
      participantIdentity: user.id
    };

    if (ingressType === IngressInput.WHIP_INPUT) {
      options.bypassTranscoding = true;
    } else {
      options.video = {
        source: 1,
        preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS
      };
      options.audio = {
        source: 2,
        preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS
      };
    }

    const ingress = await this.liveKitService.ingress.createIngress(
      ingressType,
      options
    );

    if (!ingress?.url || !ingress?.streamKey || !ingress?.ingressId) {
      throw new BadRequestException(
        'Failed to create incoming stream: missing required fields'
      );
    }

    await this.prismaService.stream.update({
      where: {
        userId: user.id
      },
      data: {
        ingressId: ingress.ingressId,
        serverUrl: ingress.url,
        streamKey: ingress.streamKey
      }
    });

    return true;
  }

  private async resetIngresses(user: User) {
    const ingresses = await this.liveKitService.ingress.listIngress({
      roomName: user.id
    });

    const rooms = await this.liveKitService.room.listRooms([user.id]);

    for (const room of rooms) {
      await this.liveKitService.room.deleteRoom(room.name);
    }

    for (const ingress of ingresses) {
      if (ingress.ingressId) {
        await this.liveKitService.ingress.deleteIngress(ingress.ingressId);
      }
    }
  }
}
