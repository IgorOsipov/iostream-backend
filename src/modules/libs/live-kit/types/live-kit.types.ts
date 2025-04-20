import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const LiveKitOptionsSymbol = Symbol('LiveKitOptionsSymbol');

export type LiveKitOptions = {
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
};

export type LiveKitAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<LiveKitOptions>, 'useFactory' | 'inject'>;
