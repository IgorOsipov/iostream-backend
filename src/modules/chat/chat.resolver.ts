import { Resolver } from '@nestjs/graphql';

import { ChatService } from './chat.service';

@Resolver('Chat')
export class ChatResolver {
  public constructor(private readonly chatService: ChatService) {}
}
