import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { SocialLinkModel } from '@/src/modules/auth/profile/models/social-link.model';
import { StreamModel } from '@/src/modules/stream/models/stream.model';

@ObjectType()
export class UserModel implements User {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public email: string;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public username: string;

  @Field(() => String)
  public displayName: string;

  @Field(() => String, { nullable: true })
  public avatar: string | null;

  @Field(() => String, { nullable: true })
  public bio: string | null;

  @Field(() => Boolean)
  public isVerified: boolean;

  @Field(() => Boolean)
  public isEmailVerified: boolean;

  @Field(() => Boolean)
  public isTotpEnabled: boolean;

  @Field(() => String, { nullable: true })
  public totpSecret: string | null;

  @Field(() => Boolean)
  public isDeactivated: boolean;

  @Field(() => [SocialLinkModel])
  public socialLinks: SocialLinkModel[];

  @Field(() => StreamModel)
  public stream: StreamModel;

  @Field(() => Date, { nullable: true })
  public deactivatedAt: Date | null;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
