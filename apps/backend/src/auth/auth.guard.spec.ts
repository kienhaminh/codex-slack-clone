import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { AuthService } from './auth.service';
import { AUTH_SERVICE } from './auth.tokens';
import { Test } from '@nestjs/testing';

describe('AuthGuard', () => {
  const service: jest.Mocked<AuthService> = {
    verifyAuthHeader: jest.fn(() => 1),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  let guard: AuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: AUTH_SERVICE, useValue: service }, AuthGuard],
    }).compile();
    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('verifies token and sets userId', () => {
    const req = { headers: { authorization: 'Bearer token' } } as any;
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
    expect(service.verifyAuthHeader).toHaveBeenCalledWith('Bearer token');
    expect(req.userId).toBe(1);
  });

  it('throws when verifyAuthHeader fails', () => {
    service.verifyAuthHeader.mockImplementationOnce(() => {
      throw new Error('bad');
    });
    const req = { headers: { authorization: 'x' } } as any;
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow('bad');
  });
});
