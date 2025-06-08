import { createUserService } from './user.service';
import type { UserRepository } from './user.types';

const user = {
  id: 1,
  email: 'e@test.com',
  passwordHash: null,
  googleId: null,
  name: 'Alice',
  avatarUrl: null,
};

describe('createUserService', () => {
  let repo: jest.Mocked<UserRepository>;
  let service: ReturnType<typeof createUserService>;

  beforeEach(() => {
    repo = {
      findUserById: jest.fn(async () => user),
      updateUser: jest.fn(async () => user),
    } as unknown as jest.Mocked<UserRepository>;
    service = createUserService(repo);
  });

  it('returns current user', async () => {
    await expect(service.getCurrentUser(1)).resolves.toBe(user);
    expect(repo.findUserById).toHaveBeenCalledWith(1);
  });

  it('updates profile', async () => {
    await service.updateProfile(1, { name: 'Bob' });
    expect(repo.updateUser).toHaveBeenCalledWith(1, { name: 'Bob' });
  });

  it('uploads avatar', async () => {
    await service.uploadAvatar(1, 'path');
    expect(repo.updateUser).toHaveBeenCalledWith(1, { avatarUrl: 'path' });
  });
});
