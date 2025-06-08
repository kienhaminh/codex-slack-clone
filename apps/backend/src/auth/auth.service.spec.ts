import { createHash } from 'crypto';
import { createAuthService } from './auth.service';
import { signJwt } from './jwt';
import type { AuthRepository, Session, PasswordResetToken } from './auth.types';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('createAuthService', () => {
  let repo: jest.Mocked<AuthRepository>;
  let service: ReturnType<typeof createAuthService>;

  beforeEach(() => {
    repo = {
      findUserByEmail: jest.fn(),
      insertUser: jest.fn(async (d) => ({ id: 1, googleId: null, ...d })),
      createSession: jest.fn(async (d) => ({ id: '1', ...d } as Session)),
      findSessionByTokenHash: jest.fn(),
      deleteSession: jest.fn(),
      createPasswordReset: jest.fn(
        async (d) => ({ id: '1', ...d } as PasswordResetToken),
      ),
      findPasswordResetByTokenHash: jest.fn(),
      deletePasswordReset: jest.fn(),
      updateUserPassword: jest.fn(),
    };
    service = createAuthService(repo, 'secret');
  });

  it('registers new user', async () => {
    repo.findUserByEmail.mockResolvedValueOnce(undefined);
    const tokens = await service.register('a@test.com', 'pass', 'A');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'a@test.com',
      name: 'A',
      passwordHash: 'x',
      googleId: null,
    });
    await expect(service.register('a@test.com', 'p', 'A')).rejects.toThrow(
      'Email already taken',
    );
  });

  it('logs in existing user', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'a@test.com',
      name: 'A',
      passwordHash:
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      googleId: null,
    });
    const tokens = await service.login('a@test.com', 'test');
    expect(tokens.refreshToken).toBeDefined();
  });

  it('rejects invalid credentials when user missing', async () => {
    repo.findUserByEmail.mockResolvedValueOnce(undefined);
    await expect(service.login('missing@test.com', 'p')).rejects.toThrow('Invalid credentials');
  });

  it('rejects invalid credentials with wrong password', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'a@test.com',
      name: 'A',
      passwordHash: sha256('pass'),
      googleId: null,
    });
    await expect(service.login('a@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('logs out existing session', async () => {
    const session = {
      id: 's1',
      userId: 1,
      refreshTokenHash: sha256('r'),
      expiresAt: new Date(),
    } as Session;
    repo.findSessionByTokenHash.mockResolvedValueOnce(session);
    await service.logout('r');
    expect(repo.deleteSession).toHaveBeenCalledWith('s1');
  });

  it('ignores logout when session not found', async () => {
    repo.findSessionByTokenHash.mockResolvedValueOnce(undefined);
    await service.logout('x');
    expect(repo.deleteSession).not.toHaveBeenCalled();
  });

  it('refreshes token with valid session', async () => {
    const future = new Date(Date.now() + 1000);
    const session = {
      id: 's1',
      userId: 1,
      refreshTokenHash: sha256('r'),
      expiresAt: future,
    } as Session;
    repo.findSessionByTokenHash.mockResolvedValueOnce(session);
    const tokens = await service.refresh('r');
    expect(repo.deleteSession).toHaveBeenCalledWith('s1');
    expect(tokens.accessToken).toBeDefined();
  });

  it('rejects expired refresh token', async () => {
    const past = new Date(Date.now() - 1000);
    const session = {
      id: 's1',
      userId: 1,
      refreshTokenHash: sha256('r'),
      expiresAt: past,
    } as Session;
    repo.findSessionByTokenHash.mockResolvedValueOnce(session);
    await expect(service.refresh('r')).rejects.toThrow('Invalid refresh token');
  });

  it('creates password reset token for known email', async () => {
    repo.findUserByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'a@test.com',
      name: 'A',
      passwordHash: 'x',
      googleId: null,
    });
    await service.forgotPassword('a@test.com');
    expect(repo.createPasswordReset).toHaveBeenCalled();
  });

  it('skips password reset for unknown email', async () => {
    repo.findUserByEmail.mockResolvedValueOnce(undefined);
    await service.forgotPassword('missing@test.com');
    expect(repo.createPasswordReset).not.toHaveBeenCalled();
  });

  it('changes password with valid token', async () => {
    const future = new Date(Date.now() + 1000);
    const record = {
      id: 't1',
      userId: 1,
      tokenHash: sha256('t'),
      expiresAt: future,
    } as PasswordResetToken;
    repo.findPasswordResetByTokenHash.mockResolvedValueOnce(record);
    await service.changePassword('t', 'new');
    expect(repo.updateUserPassword).toHaveBeenCalledWith(1, sha256('new'));
    expect(repo.deletePasswordReset).toHaveBeenCalledWith('t1');
  });

  it('rejects invalid password reset token', async () => {
    repo.findPasswordResetByTokenHash.mockResolvedValueOnce(undefined);
    await expect(service.changePassword('bad', 'x')).rejects.toThrow(
      'Invalid token',
    );
  });

  it('rejects expired password reset token', async () => {
    const past = new Date(Date.now() - 1000);
    const record = {
      id: 't1',
      userId: 1,
      tokenHash: sha256('t'),
      expiresAt: past,
    } as PasswordResetToken;
    repo.findPasswordResetByTokenHash.mockResolvedValueOnce(record);
    await expect(service.changePassword('t', 'x')).rejects.toThrow(
      'Invalid token',
    );
  });

  it('verifies valid auth header', () => {
    const token = signJwt({ sub: 1 }, 'secret', 10);
    const userId = service.verifyAuthHeader(`Bearer ${token}`);
    expect(userId).toBe(1);
  });

  it('rejects invalid auth header', () => {
    expect(() => service.verifyAuthHeader('')).toThrow('Unauthorized');
  });

  it('rejects tampered token', () => {
    expect(() => service.verifyAuthHeader('Bearer a.b.c')).toThrow(
      'Invalid token',
    );
  });
});
