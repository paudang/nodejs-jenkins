import { User as UserEntity } from '@/domain/user';
import UserModel from '@/infrastructure/database/models/User';

export class UserRepository {
  async save(user: UserEntity): Promise<UserEntity> {
    const newUser = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    return { id: newUser._id.toString(), name: newUser.name, email: newUser.email };
  }

  async findById(id: number | string): Promise<UserEntity | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return { id: user._id.toString(), name: user.name, email: user.email };
  }

  async getUsers(): Promise<UserEntity[]> {
    const users = await UserModel.find();
    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }));
  }

  async update(id: number | string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) return null;
    return { id: user._id.toString(), name: user.name, email: user.email };
  }

  async delete(id: number | string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
