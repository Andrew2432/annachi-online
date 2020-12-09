import { UserResponse } from './User';

export interface UserErrorResponse {
  readonly serverError: UserResponse;
  readonly userNotFoundError: UserResponse;
  readonly usernameAlreadyExistsError: UserResponse;
  readonly emailAlreadyExistsError: UserResponse;
  readonly usernamePasswordIncorrectError: UserResponse;
  readonly usernameOrEmailNotFoundError: UserResponse;
  readonly usernameOrEmailPasswordIncorrectError: UserResponse;
  readonly emailNotFoundError: UserResponse;
  readonly resetPasswordTokenExpiredError: UserResponse;
}
