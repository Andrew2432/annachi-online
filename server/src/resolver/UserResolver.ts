import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { hash, verify } from 'argon2';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { get } from 'config';
import { getConnection } from 'typeorm';

import User from '../entity/User';
import {
  UserError,
  UserRegisterInput,
  UserLoginInput,
  UserResponse,
} from '../typings/User';
import { MyContext } from '../typings/MyContext';
import registerSchema from '../utils/yupSchema/registerSchema';
import { emailSchema, usernameSchema } from '../utils/yupSchema/loginSchema';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/yupSchema/forgotPassword';
import userErrorResponses from '../utils/userErrorResponses';
import sendMail from '../utils/sendMail';

@Resolver()
export default class UserResolver {
  /** Array of errors */
  errorsArr: UserError[] = [];

  /**
   * Simple query to fetch user ids
   */
  @Query(() => [User], { nullable: true })
  async showUsers(): Promise<User[] | null> {
    return (await User.find()) || null;
  }

  /**
   * Register a new user
   */
  @Mutation(() => UserResponse)
  async registerUser(
    @Arg('options') { username, email, password }: UserRegisterInput,
    @Ctx() { logger }: MyContext
  ): Promise<UserResponse> {
    try {
      //  Validation
      try {
        await registerSchema.validate(
          { username, email, password },
          { abortEarly: false }
        );
      } catch (validationErr) {
        return this.mapErrors(validationErr);
      }

      //  Check if user already exists
      const existingUser = await getConnection()
        .createQueryBuilder(User, 'user')
        .where('username = :username OR email = :email', { username, email })
        .getOne();

      if (existingUser?.username === username) {
        return userErrorResponses.usernameAlreadyExistsError;
      }
      if (existingUser?.email === email) {
        return userErrorResponses.emailAlreadyExistsError;
      }

      //  Save to database and return the user
      return {
        user: await User.create({
          username,
          email,
          password: await hash(password),
        }).save(),
      };
    } catch (error) {
      logger.error(
        `>>>>>\n UserResolver -> registerUser -> ${JSON.stringify(
          error
        )}\n <<<<<\n`
      );
      return userErrorResponses.serverError;
    }
  }

  /**
   * Login a user
   */
  @Mutation(() => UserResponse)
  async loginUser(
    @Arg('options') { usernameOrEmail, password }: UserLoginInput,
    @Ctx() { req, logger }: MyContext
  ): Promise<UserResponse> {
    try {
      //  Validation
      try {
        if (usernameOrEmail.includes('@')) {
          await emailSchema.validate(
            { email: usernameOrEmail, password },
            { abortEarly: false }
          );
        } else {
          await usernameSchema.validate(
            { username: usernameOrEmail, password },
            { abortEarly: false }
          );
        }
      } catch (validationErr) {
        return this.mapErrors(validationErr);
      }

      //  Verification
      const existingUser = await User.findOne(
        usernameOrEmail.includes('@')
          ? { where: { email: usernameOrEmail } }
          : { where: { username: usernameOrEmail } }
      );

      if (!existingUser) {
        return userErrorResponses.usernameOrEmailNotFoundError;
      }

      const isCorrectPass = await verify(existingUser.password, password);

      if (!isCorrectPass) {
        return userErrorResponses.usernameOrEmailPasswordIncorrectError;
      }

      //  Verified user - Create cookie
      req.session.userId = existingUser.id;

      return {
        user: existingUser,
      };
    } catch (error) {
      logger.error(
        `>>>>>\n
        UserResolver -> loginUser -> ${JSON.stringify(error)}\n
        <<<<\n`
      );
      return userErrorResponses.serverError;
    }
  }

  @Mutation(() => UserResponse)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { logger, redisClient }: MyContext
  ): Promise<UserResponse> {
    try {
      //  Validation
      try {
        await forgotPasswordSchema.validate({ email }, { abortEarly: false });
      } catch (validationErr) {
        return this.mapErrors(validationErr);
      }

      //  Check if user exists
      const existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        return userErrorResponses.emailNotFoundError;
      }

      //  Generate a temporary token
      const token = uuidv4();

      //  Store token in redis
      await redisClient.set(
        `${get('forgotPassword.prefix')}${token}`,
        existingUser.id,
        'ex',
        get<number>('forgotPassword.expiry')
      );

      //  Send the email
      await sendMail(existingUser.email, 'Reset Password Link', {
        template: 'passwordReset',
        values: {
          username: existingUser.username,
          resetLink: `http://localhost:3000/change-password/${token}`,
        },
      });

      return {
        userOperations: {
          userResetPassword: {
            isSuccessful: true,
            isUserResetPassword: false,
            isResetEmailSent: true,
          },
        },
      };
    } catch (error) {
      logger.error(
        `>>>>>\n UserResolver -> forgotPassword -> ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );

      return userErrorResponses.serverError;
    }
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('password') password: string,
    @Ctx() { redisClient, req, logger }: MyContext
  ): Promise<UserResponse> {
    try {
      //  Validation
      try {
        await resetPasswordSchema.validate({ password }, { abortEarly: false });
      } catch (validationError) {
        return this.mapErrors(validationError);
      }

      const key = `${get('forgotPassword.prefix')}${token}`;
      const userId = await redisClient.get(key);

      //  Check if token exists
      if (!userId) {
        return {
          ...userErrorResponses.resetPasswordTokenExpiredError,
          userOperations: {
            userResetPassword: {
              isResetEmailSent: true,
              isSuccessful: false,
              isUserResetPassword: false,
            },
          },
        };
      }

      const existingUser = await User.findOne(userId);

      //  Check if user exists
      if (!existingUser) {
        return {
          ...userErrorResponses.userNotFoundError,
          userOperations: {
            userResetPassword: {
              isResetEmailSent: true,
              isSuccessful: false,
              isUserResetPassword: false,
            },
          },
        };
      }

      //  Update the password
      await User.update({ id: userId }, { password: await hash(password) });

      //  Delete entry in redis
      await redisClient.del(key);

      //  Log in user after change password
      req.session.userId = existingUser.id;

      return {
        user: existingUser,
        userOperations: {
          userResetPassword: {
            isResetEmailSent: true,
            isSuccessful: true,
            isUserResetPassword: true,
          },
        },
      };
    } catch (error) {
      logger.error(
        `>>>>>\n UserResolver -> changePassword -> ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );

      return {
        ...userErrorResponses.serverError,
        userOperations: {
          userResetPassword: {
            isResetEmailSent: true,
            isSuccessful: false,
            isUserResetPassword: false,
          },
        },
      };
    }
  }

  /**
   * Utility method to map errors to object
   * @param validationErr The error object
   */
  mapErrors(validationErr: any): UserResponse {
    this.errorsArr = [];
    validationErr.inner.forEach((error: yup.ValidationError) => {
      this.errorsArr.push({
        field: error.path,
        message: error.errors[0],
      });
    });

    return {
      errors: this.errorsArr,
    };
  }
}
