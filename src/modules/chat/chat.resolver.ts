import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { ChatService } from './chat.service';
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input';
import { SendMessageInput } from './inputs/send-message.input';
import { ChatMessageModel } from './model/chat-message.model';

@Resolver('Chat')
export class ChatResolver {
  private readonly pubSub: PubSub;
  public constructor(private readonly chatService: ChatService) {
    this.pubSub = new PubSub();
  }

  @Query(() => [ChatMessageModel], { name: 'findMessagesByStream' })
  public async findByStream(@Args('streamId') streamId: string) {
    return this.chatService.findByStream(streamId);
  }

  @Authorization()
  @Mutation(() => ChatMessageModel, { name: 'sendMessage' })
  public async sendMessage(
    @Authorized('id') userId: string,
    @Args('data') input: SendMessageInput
  ) {
    const message = await this.chatService.sendMessage(userId, input);
    await this.pubSub.publish('CHAT_MESSAGE_ADDED', {
      chatMessageAdded: message
    });

    return message;
  }

  @Subscription(() => ChatMessageModel, {
    name: 'chatMessageAdded',
    filter: (
      payload: { chatMessageAdded: ChatMessageModel },
      variables: { streamId: string }
    ) => payload.chatMessageAdded.streamId === variables.streamId
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public chatMessageAdded(@Args('streamId') streamId: string) {
    return this.pubSub.asyncIterableIterator('CHAT_MESSAGE_ADDED');
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeChatSettings' })
  public async changeSettings(
    @Authorized() user: User,
    @Args('data') input: ChangeChatSettingsInput
  ) {
    return this.chatService.changeSettings(user, input);
  }
}
