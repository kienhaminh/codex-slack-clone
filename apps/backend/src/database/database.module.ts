import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DB = Symbol('DB');

export function createDb(): ReturnType<typeof drizzle> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  const pool = new Pool({ connectionString });
  return drizzle(pool);
}

@Module({
  providers: [{ provide: DB, useFactory: createDb }],
  exports: [DB],
})
export class DatabaseModule {}
