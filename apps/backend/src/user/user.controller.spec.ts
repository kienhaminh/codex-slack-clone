import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { USER_SERVICE } from './user.tokens';
import type { UserService } from './user.types';
import { AuthGuard } from '../auth/auth.guard';

describe('UserController', () => {
  let controller: UserController;
  const service: jest.Mocked<UserService> = {
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: USER_SERVICE, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UserController);
  });

  it('calls getCurrentUser on service', () => {
    controller.me({ userId: 1 } as any);
    expect(service.getCurrentUser).toHaveBeenCalledWith(1);
  });

  it('calls updateProfile on service', () => {
    controller.update({ name: 'B' }, { userId: 1 } as any);
    expect(service.updateProfile).toHaveBeenCalledWith(1, { name: 'B' });
  });

  it('calls uploadAvatar on service', () => {
    controller.uploadAvatar({ avatarUrl: 'p' }, { userId: 1 } as any);
    expect(service.uploadAvatar).toHaveBeenCalledWith(1, 'p');
  });
});
