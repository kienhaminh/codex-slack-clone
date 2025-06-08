import { createDb } from './database.module';

describe('createDb', () => {
  const originalUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalUrl;
  });

  it('throws without DATABASE_URL', () => {
    delete process.env.DATABASE_URL;
    expect(() => createDb()).toThrow('DATABASE_URL is not defined');
  });

  it('returns drizzle instance with env', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    const db = createDb();
    expect(db).toBeDefined();
  });
});
