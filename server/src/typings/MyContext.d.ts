import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Redis } from 'ioredis';
import { Logger } from 'winston';

import AWSS3Uploader from '../services/s3/S3Upload';

interface MySession extends Session {
  session: {
    userId: string;
  };
}

export interface MyContext {
  req: Request & MySession;
  res: Response;
  redisClient: Redis;
  logger: Logger;
  s3: AWSS3Uploader;
}
