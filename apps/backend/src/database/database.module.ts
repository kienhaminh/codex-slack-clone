import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DB = Symbol('DB');

export function createDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
}

@Module({
  providers: [{ provide: DB, useFactory: createDb }],
  exports: [DB],
})
export class DatabaseModule {}
