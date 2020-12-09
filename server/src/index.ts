import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import session from 'express-session';
import { Connection, createConnection } from 'typeorm';
import { get } from 'config';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';

// import seed from '../config/seed';
import connectionOptions from './ormconfig';
import AWSS3Uploader from './services/s3/S3Upload';
import UserResolver from './resolver/UserResolver';
import logger from './utils/logger';
import FileResolver from './resolver/FileResolver';
// import sendMail from './utils/sendMail';

/** Express server instance */
let app: Express | null = null;

/** TypeORM connection instance */
let connection: Connection | null = null;

/** Apollo GraphQL server instance */
let apolloServer: ApolloServer | null = null;

/** Redis store instance */
let RedisStore: connectRedis.RedisStore | null = null;

/** Client for Redis */
let redisClient: Redis.Redis | null = null;

let s3: AWSS3Uploader | null = null;

/** Port number of server */
const PORT = process.env.PORT || 5000;

/**
 * Initialize server using IIFE pattern
 */
(async () => {
  // TODO: Handle exception when redis fails to connect
  try {
    /** Provide env variables access */
    dotenv.config();

    /** Initialize Express server */
    app = express();

    // Send a test email
    // await sendMail('andrewjoel046@gmail.com', 'Hello', {
    //   template: 'hello',
    //   values: {
    //     username: 'Andrew',
    //   },
    // });

    /** Initialize Redis */
    RedisStore = connectRedis(session);
    redisClient = new Redis(process.env.REDIS_URL);

    if (!RedisStore || !redisClient) {
      throw new Error(`Failed to connect to Redis server.`);
    } else {
      logger.info(
        `>>>>>\n index -> Connected to Redis server successfully \n<<<<<\n`
      );
    }

    /** Apply middleware options */
    app.set('trust proxy', 1);

    app.use(
      cors({
        origin: get('cors.origin'),
        credentials: get<boolean>('cors.credentials'),
      })
    );

    /** Set view engine to ejs */
    app.set('view engine', 'ejs');

    /** Set the path to views directory */
    app.set('views', path.join(__dirname, 'views'));

    /** Apply session middleware */
    app.use(
      session({
        name: get('cookie.name'),
        store: new RedisStore({ client: redisClient }),
        secret: get('cookie.secret'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: get<number>('cookie.duration'),
          httpOnly: true,
          sameSite: 'lax',
          secure: get<boolean>('cookie.secure'),
        },
      })
    );

    /** Use GraphQL upload instead of default Apollo */
    app.use(
      graphqlUploadExpress({
        maxFileSize: get<number>('files.graphqlUploadSizeLimit'),
        maxFiles: get<number>('files.graphqlUploadFilesLimit'),
      })
    );

    //  Create a health-check route to check if server is running
    app.get('/_health', (_, res) => {
      res.status(200).send(`Server is running`);
    });

    /** Attempt to connect to database using TypeORM */
    try {
      connection = await createConnection(connectionOptions);
      logger.info(`>>>>>\n index -> Database connection established \n<<<<<\n`);
    } catch (error) {
      logger.error(
        `>>>>>\n index -> Database instantiation error -> ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );
    }

    //  Run migrations
    if (connection) await connection.runMigrations();

    // Run the seed
    // await seed();

    /** Attempt to intialize AWS S3 */
    try {
      s3 = new AWSS3Uploader({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
        destinationBucketName: process.env.AWS_S3_BUCKET_NAME as string,
        region: process.env.AWS_S3_BUCKET_REGION as string,
      });

      logger.info(
        `\n>>>>>\n index -> AWS S3 instantiated successfully \n<<<<<\n`
      );
    } catch (error) {
      logger.error(
        `\n>>>>>\n index -> AWS S3 instantiation error: ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );
    }

    /** Attempt to initialize Apollo server */
    try {
      apolloServer = new ApolloServer({
        schema: await buildSchema({
          resolvers: [UserResolver, FileResolver],
          validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redisClient, logger, s3 }),
        uploads: false,
      });
      logger.info(
        `>>>>>\n index -> Apollo server instantiated successfully \n<<<<<\n`
      );
    } catch (error) {
      logger.error(
        `>>>>>\n index -> Apollo server instantiation error -> ${JSON.stringify(
          error
        )} \n<<<<<\n`
      );
    }

    /** Use Express server as middleware for Apollo */
    if (apolloServer) apolloServer.applyMiddleware({ app, cors: false });

    /** Initialize the server */
    app.listen(PORT, () =>
      logger.info(`>>>>>\n index -> Server started at port ${PORT}. \n<<<<<\n`)
    );
  } catch (error) {
    /**
     * This error will only occur under rare conditions such as
     * - Memory problems
     * - Error mishandled somewhere
     */
    logger.error(
      `>>>>>\n server -> Internal Server Error: ${JSON.stringify(
        error
      )} \n<<<<<\n`
    );
  }
})();

/**
 * Cleanup during closing of server
 * @param finishReason The reason for closing the server
 * @param exitCode The exit value used in process.exit(). 1: error, 0: error-less
 */
// const finish = async (finishReason: string, exitCode: number) => {
//   try {
//     if (connection) {
//       await connection.close();
//       logger.info(
//         `>>>>>\n index -> Database connection terminated successfully. \n<<<<<\n`
//       );
//     }

//     if (apolloServer) {
//       await apolloServer.stop();
//       logger.info(
//         `>>>>>\n index -> Apollo server terminated successfully. \n<<<<<\n`
//       );
//     }

//     if (redisClient) {
//       redisClient.disconnect();
//       logger.info(
//         `>>>>>\n index -> Redis client disconnected successfully \n<<<<<\n`
//       );
//     }
//   } catch (error) {
//     logger.error(
//       `>>>>>\n index -> Error during cleanup process: ${JSON.stringify(
//         error
//       )} \n<<<<<\n`
//     );
//   } finally {
//     logger.info(
//       `>>>>>\n index -> Server closed due to ${finishReason} \n<<<<<\n`
//     );
//     logger.info(
//       `>>>>>\n index -> Server has been terminated. Goodbye . . . \n<<<<<\n`
//     );
//     process.exit(exitCode);
//   }
// };

//  Gracefully shutdown the server under these conditions
// process.on('uncaughtException', () => finish('Uncaught Exception', 1));
// process.on('unhandledRejection', () => finish('Unhandled Rejection', 1));
// process.on('SIGTERM', () => finish('OS issued termination signal', 0));
// process.on('SIGINT', () => finish('OS issued interrupt signal', 0));
