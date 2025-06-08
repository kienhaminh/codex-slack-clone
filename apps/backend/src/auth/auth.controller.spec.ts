import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AUTH_SERVICE } from './auth.tokens';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const service: jest.Mocked<AuthService> = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
    verifyAuthHeader: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AUTH_SERVICE, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('calls register on service', () => {
    controller.register({ email: 'e', password: 'p', name: 'n' });
    expect(service.register).toHaveBeenCalledWith('e', 'p', 'n');
  });

  it('calls login on service', () => {
    controller.login({ email: 'e', password: 'p' });
    expect(service.login).toHaveBeenCalledWith('e', 'p');
  });

  it('calls logout on service', () => {
    controller.logout({ refreshToken: 'r' });
    expect(service.logout).toHaveBeenCalledWith('r');
  });

  it('returns user id from request in me()', () => {
    const result = controller.me({ userId: 1 } as any);
    expect(result).toEqual({ userId: 1 });
  });
});
