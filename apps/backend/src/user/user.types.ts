import type { User } from '../auth/auth.types';

export interface UserRepository {
  findUserById(id: number): Promise<User | undefined>;
  updateUser(
    id: number,
    data: Partial<Pick<User, 'name' | 'avatarUrl'>>,
  ): Promise<User>;
}

export interface UserService {
  getCurrentUser(id: number): Promise<User>;
  updateProfile(id: number, data: { name: string }): Promise<User>;
  uploadAvatar(id: number, path: string): Promise<User>;
}
