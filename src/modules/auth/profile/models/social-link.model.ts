import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { SocialLink } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';

@ObjectType()
export class SocialLinkModel implements SocialLink {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public url: string;

  @Field(() => Number)
  public position: number;

  @Field(() => String, { nullable: true })
  public userId: string | null;

  @Field(() => UserModel, { nullable: true })
  public user: UserModel | null;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
