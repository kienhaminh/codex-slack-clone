export interface User {
  id: number;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  name: string;
  avatarUrl: string | null;
}

export interface Session {
  id: string;
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | undefined>;
  insertUser(
    data: Omit<User, 'id' | 'googleId' | 'passwordHash'> & {
      passwordHash: string | null;
    },
  ): Promise<User>;
  createSession(data: Omit<Session, 'id'>): Promise<Session>;
  findSessionByTokenHash(hash: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  createPasswordReset(
    data: Omit<PasswordResetToken, 'id'>,
  ): Promise<PasswordResetToken>;
  findPasswordResetByTokenHash(
    hash: string,
  ): Promise<PasswordResetToken | undefined>;
  deletePasswordReset(id: string): Promise<void>;
  updateUserPassword(userId: number, passwordHash: string): Promise<void>;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
