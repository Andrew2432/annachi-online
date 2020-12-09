import { UserErrorResponse } from '../typings/UserErrorResponse';

const userErrorResponses: UserErrorResponse = {
  serverError: {
    errors: [
      {
        field: 'server',
        message: 'Internal server error.',
      },
    ],
  },

  userNotFoundError: {
    errors: [
      {
        field: 'username',
        message: 'User does not exist.',
      },
    ],
  },

  usernameAlreadyExistsError: {
    errors: [
      {
        field: 'username',
        message: 'User with this username already exists.',
      },
    ],
  },

  emailAlreadyExistsError: {
    errors: [
      {
        field: 'email',
        message: 'User with this email already exists.',
      },
    ],
  },

  usernamePasswordIncorrectError: {
    errors: [
      {
        field: 'username',
        message: 'Username or password is incorrect.',
      },
    ],
  },

  usernameOrEmailNotFoundError: {
    errors: [
      {
        field: 'usernameOrEmail',
        message: 'User does not exist.',
      },
    ],
  },

  usernameOrEmailPasswordIncorrectError: {
    errors: [
      {
        field: 'usernameOrEmail',
        message: 'Invalid credentials.',
      },
    ],
  },

  emailNotFoundError: {
    errors: [
      {
        field: 'email',
        message: 'Invalid email',
      },
    ],
  },

  resetPasswordTokenExpiredError: {
    errors: [
      {
        field: 'password',
        message: 'Token expired',
      },
    ],
  },
};

export default userErrorResponses;
