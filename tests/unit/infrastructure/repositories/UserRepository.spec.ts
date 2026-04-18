import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import UserModel from '@/infrastructure/database/models/User';

// Mock DB Model Database Layer
jest.mock('@/infrastructure/database/models/User');

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save and return a newly created user (Happy Path)', async () => {
      // Arrange
      const payload = {
        id: '',
        name: 'TestUser',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockDbRecord = {
        _id: { toString: () => '1' },
        name: 'TestUser',
        email: 'test@example.com',
      };
      (UserModel.create as jest.Mock).mockResolvedValue(mockDbRecord);

      // Act
      const result = await userRepository.save(payload);

      // Assert
      expect(result).toEqual({ id: '1', name: 'TestUser', email: 'test@example.com' });
      expect(UserModel.create).toHaveBeenCalledWith({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
    });

    it('should throw an error when DB fails explicitly (Edge Case)', async () => {
      // Arrange
      const payload = {
        id: '',
        name: 'FailUser',
        email: 'fail@example.com',
        password: 'password123',
      };
      const error = new Error('DB Connection Refused');
      (UserModel.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(userRepository.save(payload)).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should find and return a user by id (Happy Path)', async () => {
      // Arrange
      const id = '1';
      const mockDbRecord = {
        _id: { toString: () => '1' },
        name: 'TestUser',
        email: 'test@example.com',
      };
      (UserModel.findById as jest.Mock).mockResolvedValue(mockDbRecord);

      // Act
      const result = await userRepository.findById(id);

      // Assert
      expect(result).toEqual({ id: '1', name: 'TestUser', email: 'test@example.com' });
      expect(UserModel.findById).toHaveBeenCalledWith(id);
    });

    it('should return null if user not found', async () => {
      // Arrange
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should return a list of mapped UserEntities (Happy Path)', async () => {
      // Arrange
      const mockDbRecords = [
        { _id: { toString: () => '1' }, name: 'User1', email: 'user1@example.com' },
      ];
      (UserModel.find as jest.Mock).mockResolvedValue(mockDbRecords);

      // Act
      const result = await userRepository.getUsers();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: '1', name: 'User1', email: 'user1@example.com' });
      expect(UserModel.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the user (Happy Path)', async () => {
      // Arrange
      const id = '1';
      const data = { name: 'Updated' };
      const mockDbRecord = {
        _id: { toString: () => '1' },
        name: 'Updated',
        email: 'test@example.com',
      };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDbRecord);

      // Act
      const result = await userRepository.update(id, data);

      // Assert
      expect(result?.name).toEqual(data.name);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should return null when user not found (Error Handling)', async () => {
      // Arrange
      const id = '999';
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.update(id, { name: 'Fail' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should successfully delete a user (Happy Path)', async () => {
      // Arrange
      const id = '1';

      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await userRepository.delete(id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user not found during deletion (Error Handling)', async () => {
      // Arrange
      const id = '999';
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.delete(id);

      // Assert
      expect(result).toBe(false);
    });
  });
});
