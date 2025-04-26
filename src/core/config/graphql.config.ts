import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { type GqlContext } from '@/src/shared/types/gql-context.types';
import { isDev } from '@/src/shared/utils/is-dev.util';

export const getGraphQLConfig: (
  configService: ConfigService
) => ApolloDriverConfig = configService => {
  return {
    playground: isDev(configService),
    path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
    autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),
    sortSchema: true,
    context: ({ req, res }: GqlContext) => ({ req, res }),
    installSubscriptionHandlers: true
  };
};
