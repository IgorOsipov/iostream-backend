import { type DynamicModule, Module } from '@nestjs/common';

import { LiveKitService } from './live-kit.service';
import {
  LiveKitAsyncOptions,
  type LiveKitOptions,
  LiveKitOptionsSymbol
} from './types/live-kit.types';

@Module({})
export class LiveKitModule {
  public static register(options: LiveKitOptions): DynamicModule {
    return {
      module: LiveKitModule,
      providers: [
        { provide: LiveKitOptionsSymbol, useValue: options },
        LiveKitService
      ],
      exports: [LiveKitService],
      global: true
    };
  }

  public static registerAsync(options: LiveKitAsyncOptions): DynamicModule {
    return {
      module: LiveKitModule,
      imports: options.imports || [],
      providers: [
        {
          provide: LiveKitOptionsSymbol,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        LiveKitService
      ],
      exports: [LiveKitService],
      global: true
    };
  }
}
