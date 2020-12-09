import { InputType, Field, ObjectType } from 'type-graphql';
import User from '../entity/User';

@InputType()
export class UserRegisterInput {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UserLoginInput {
  @Field()
  usernameOrEmail!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class UserError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class UserResetPassword {
  @Field()
  isSuccessful!: boolean;

  @Field()
  isResetEmailSent!: boolean;

  @Field()
  isUserResetPassword!: boolean;
}

@ObjectType()
export class UserOperations {
  @Field(() => UserResetPassword, { nullable: true })
  userResetPassword!: UserResetPassword;
}

@ObjectType()
export class UserResponse {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];

  @Field(() => User, { nullable: true })
  user?: Partial<User>;

  @Field(() => UserOperations, { nullable: true })
  userOperations?: UserOperations;
}
