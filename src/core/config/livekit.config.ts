import { ConfigService } from '@nestjs/config';

import { LiveKitOptions } from '@/src/modules/libs/live-kit/types/live-kit.types';

export function getLiveKitConfig(configService: ConfigService): LiveKitOptions {
  return {
    apiUrl: configService.getOrThrow<string>('LIVE_API_URL'),
    apiKey: configService.getOrThrow<string>('LIVE_API_KEY'),
    apiSecret: configService.getOrThrow<string>('LIVE_API_SECRET')
  };
}
