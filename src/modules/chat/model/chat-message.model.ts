import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { ChatMessage } from '@/prisma/generated';

@ObjectType()
export class ChatMessageModel implements ChatMessage {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public text: string;

  @Field(() => String)
  public userId: string;

  @Field(() => String)
  public streamId: string;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
