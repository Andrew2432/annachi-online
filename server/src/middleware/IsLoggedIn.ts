import { MiddlewareFn, NextFn } from 'type-graphql';

import { MyContext } from '../typings/MyContext';
import { UserResponse } from '../typings/User';

const IsLoggedIn: MiddlewareFn<MyContext> = async (
  { context: { req } },
  next
): Promise<UserResponse | NextFn> => {
  if (!req.session.userId) {
    return {
      errors: [
        {
          field: 'user',
          message: 'User not logged in',
        },
      ],
    };
  }
  return next();
};

export default IsLoggedIn;
