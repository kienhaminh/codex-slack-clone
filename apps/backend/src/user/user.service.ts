import type { UserRepository, UserService } from './user.types';

export function createUserService(repo: UserRepository): UserService {
  async function getCurrentUser(id: number) {
    const user = await repo.findUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async function updateProfile(id: number, data: { name: string }) {
    return repo.updateUser(id, { name: data.name });
  }

  async function uploadAvatar(id: number, path: string) {
    return repo.updateUser(id, { avatarUrl: path });
  }

  return {
    getCurrentUser,
    updateProfile,
    uploadAvatar,
  };
}
