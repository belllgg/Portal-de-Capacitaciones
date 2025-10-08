import { registerAs } from '@nestjs/config';

export default registerAs('configuration', () => ({
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  TIMEOUT: parseInt(process.env.TIMEOUT ?? '30000', 10),
  API_PREFIX: process.env.API_PREFIX ?? '/',

  DB: {
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
    DB_NAME: process.env.DB_NAME ?? 'database',
    DB_USER: process.env.DB_USER ?? 'user',
    DB_PASS: process.env.DB_PASSWORD ?? '',
    DB_TYPE: (process.env.DB_TYPE ?? 'postgres') as 'mssql' | 'postgres',
  },


}));
