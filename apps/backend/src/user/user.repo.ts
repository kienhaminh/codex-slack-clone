/* istanbul ignore file */
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from '../database/schema';
import type { UserRepository } from './user.types';

export function createUserRepository(db: NodePgDatabase): UserRepository {
  return {
    async findUserById(id) {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] as any;
    },
    async updateUser(id, data) {
      const [row] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return row as any;
    },
  };
}
