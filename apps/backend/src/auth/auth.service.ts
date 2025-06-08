import { randomBytes, createHash } from 'crypto';
import { signJwt, verifyJwt } from './jwt';
import type { AuthRepository, Tokens, User } from './auth.types';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function createAuthService(repo: AuthRepository, secret: string) {
  async function createTokens(userId: number): Promise<Tokens> {
    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await repo.createSession({ userId, refreshTokenHash, expiresAt });
    const accessToken = signJwt({ sub: userId }, secret, 3600);
    return { accessToken, refreshToken };
  }

  async function register(
    email: string,
    password: string,
    name: string,
  ): Promise<Tokens> {
    const existing = await repo.findUserByEmail(email);
    if (existing) {
      throw new Error('Email already taken');
    }
    const user = await repo.insertUser({
      email,
      passwordHash: hash(password),
      name,
    });
    return createTokens(user.id);
  }

  async function login(email: string, password: string): Promise<Tokens> {
    const user = await repo.findUserByEmail(email);
    if (!user || !user.passwordHash || user.passwordHash !== hash(password)) {
      throw new Error('Invalid credentials');
    }
    return createTokens(user.id);
  }

  async function logout(refreshToken: string): Promise<void> {
    const tokenHash = hash(refreshToken);
    const session = await repo.findSessionByTokenHash(tokenHash);
    if (session) {
      await repo.deleteSession(session.id);
    }
  }

  async function refresh(refreshToken: string): Promise<Tokens> {
    const tokenHash = hash(refreshToken);
    const session = await repo.findSessionByTokenHash(tokenHash);
    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }
    await repo.deleteSession(session.id);
    return createTokens(session.userId);
  }

  async function forgotPassword(email: string): Promise<void> {
    const user = await repo.findUserByEmail(email);
    if (!user) return;
    const token = randomBytes(32).toString('hex');
    const tokenHash = hash(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await repo.createPasswordReset({ userId: user.id, tokenHash, expiresAt });
  }

  async function changePassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const tokenHash = hash(token);
    const record = await repo.findPasswordResetByTokenHash(tokenHash);
    if (!record || record.expiresAt < new Date()) {
      throw new Error('Invalid token');
    }
    await repo.updateUserPassword(record.userId, hash(newPassword));
    await repo.deletePasswordReset(record.id);
  }

  function verifyAuthHeader(authHeader: string): User['id'] {
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = authHeader.slice(7);
    const payload = verifyJwt<{ sub: number }>(token, secret);
    return payload.sub;
  }

  return {
    register,
    login,
    logout,
    refresh,
    forgotPassword,
    changePassword,
    verifyAuthHeader,
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
