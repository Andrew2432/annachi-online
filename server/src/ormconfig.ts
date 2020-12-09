import path from 'path';
import dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

/**
 * Access .env.development when using development mode
 * Mode can be changed in .env file
 */
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

const typeORMOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.DATABASE_PORT as string, 10),
  username: process.env.DATABASE_USER_NAME as string,
  password: process.env.DATABASE_USER_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  synchronize: false,
  logging: true,
  uuidExtension: 'pgcrypto',
  entities: ['src/entity/*.{js,ts}'],
  migrations: ['src/migration/*.{js,ts}'],
  cli: {
    entitiesDir: `src/entity`,
    migrationsDir: `src/migration`,
  },
};

export default typeORMOptions;
