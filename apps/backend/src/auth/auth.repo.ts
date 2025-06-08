/* istanbul ignore file */
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users, sessions, passwordResetTokens } from '../database/schema';
import type {
  AuthRepository,
  User,
  Session,
  PasswordResetToken,
} from './auth.types';

export function createAuthRepository(db: NodePgDatabase): AuthRepository {
  return {
    async findUserByEmail(email) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return result[0] as User | undefined;
    },
    async insertUser(data) {
      const [user] = await db.insert(users).values(data).returning();
      return user as User;
    },
    async createSession(data) {
      const [row] = await db.insert(sessions).values(data).returning();
      return row as Session;
    },
    async findSessionByTokenHash(hash) {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.refreshTokenHash, hash));
      return result[0] as Session | undefined;
    },
    async deleteSession(id) {
      await db.delete(sessions).where(eq(sessions.id, id));
    },
    async createPasswordReset(data) {
      const [row] = await db
        .insert(passwordResetTokens)
        .values(data)
        .returning();
      return row as PasswordResetToken;
    },
    async findPasswordResetByTokenHash(hash) {
      const result = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.tokenHash, hash));
      return result[0] as PasswordResetToken | undefined;
    },
    async deletePasswordReset(id) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, id));
    },
    async updateUserPassword(userId, passwordHash) {
      await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
    },
  };
}
