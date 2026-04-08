import { User as UserEntity } from '@/domain/user';
import UserModel from '@/infrastructure/database/models/User';

export class UserRepository {
  async save(user: UserEntity): Promise<UserEntity> {
    const newUser = await UserModel.create({ name: user.name, email: user.email });
    return { id: newUser.id, name: newUser.name, email: newUser.email };
  }

  async getUsers(): Promise<UserEntity[]> {
    const users = await UserModel.findAll();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  async update(id: number | string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    await user.update(data);
    return { id: user.id || 0, name: user.name, email: user.email };
  }

  async delete(id: number | string): Promise<boolean> {
    const user = await UserModel.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  }
}
