import type { Config } from 'drizzle-kit';

export default {
  dialect: "postgresql", // Added dialect
  schema: './src/database/schema.ts',
  out: './drizzle',
  // driver: 'pg', // Removed driver, Drizzle Kit should infer from dialect for pg
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? '',
  },
} satisfies Config;
