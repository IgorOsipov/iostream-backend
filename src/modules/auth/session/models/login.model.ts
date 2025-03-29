import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from '../../account/models/user.model';

@ObjectType()
export class LoginModel {
  @Field(() => UserModel)
  public user: UserModel;
}
