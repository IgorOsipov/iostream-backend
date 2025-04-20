import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/src/core/prisma/prisma.service';

import { LiveKitService } from '../libs/live-kit/live-kit.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly livekitService: LiveKitService
  ) {}

  public async receiveWebhookLivekit(body: string, authorization: string) {
    const event = this.livekitService.receiver.receive(
      body,
      authorization,
      true
    );

    if (event.event === 'ingress_started') {
      await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId
        },
        data: {
          isLive: true
        }
      });
    }

    if (event.event === 'ingress_ended') {
      await this.prismaService.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId
        },
        data: {
          isLive: false
        }
      });
    }
  }
}
