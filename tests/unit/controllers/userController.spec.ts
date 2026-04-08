import { HTTP_STATUS } from '@/utils/httpCodes';
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '@/controllers/userController';
import cacheService from '@/config/redisClient';

// Mock dependencies
jest.mock('@/models/User', () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    mockData: [],
  };
});
const User = require('@/models/User');
jest.mock('@/config/redisClient', () => ({
  getOrSet: jest.fn((_key, fetcher) => fetcher()),
  del: jest.fn(),
  flush: jest.fn(),
}));
jest.mock('@/utils/logger');

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    userController = new UserController();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    (cacheService.getOrSet as jest.Mock).mockImplementation((_key, fetcher) => fetcher());
    (cacheService.flush as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return successfully (Happy Path)', async () => {
      // Arrange
      const usersMock = [{ id: '1', name: 'Test', email: 'test@example.com' }];
      (User.findAll as jest.Mock).mockResolvedValue(usersMock);

      // Act
      await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(usersMock);
      expect(cacheService.getOrSet).toHaveBeenCalled();
    });

    it('should return an empty array when no users found', async () => {
      // Arrange
      const usersMock: any[] = [];
      (User.findAll as jest.Mock).mockResolvedValue(usersMock);

      // Act
      await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(usersMock);
    });

    it('should handle errors correctly (Error Handling)', async () => {
      // Arrange
      const error = new Error('Database Error');
      // Simulating error inside the fetcher by making User.findAll fail
      (User.findAll as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    it('should successfully create a new user (Happy Path)', async () => {
      // Arrange
      const payload = { name: 'Alice', email: 'alice@example.com' };
      mockRequest.body = payload;

      const expectedUser = { id: '1', ...payload };
      (User.create as jest.Mock).mockResolvedValue(expectedUser);

      // Act
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
      expect(User.create).toHaveBeenCalledWith(payload);
      expect(cacheService.del).toHaveBeenCalledWith('users:all');
    });

    it('should handle errors when creation fails (Error Handling)', async () => {
      // Arrange
      const error = new Error('Creation Error');
      const payload = { name: 'Bob', email: 'bob@example.com' };
      mockRequest.body = payload;

      (User.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user (Happy Path)', async () => {
      // Arrange
      const id = '1';
      const payload = { name: 'Alice Updated' };
      mockRequest.params = { id };
      mockRequest.body = payload;

      const expectedUser = { id, ...payload, email: 'alice@example.com' };
      const userMock = { ...expectedUser, update: jest.fn().mockResolvedValue(true) };
      (User.findByPk as jest.Mock).mockResolvedValue(userMock);

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalled();
      expect(User.findByPk).toHaveBeenCalledWith(id);
      expect(cacheService.del).toHaveBeenCalledWith('users:all');
    });

    it('should handle 404/errors when user not found or update fails', async () => {
      // Arrange
      const id = '999';
      mockRequest.params = { id };
      mockRequest.body = { name: 'Fail' };
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('should handle database errors during update (Error Handling)', async () => {
      // Arrange
      const id = '1';
      const error = new Error('Database Error');
      (User.findByPk as jest.Mock).mockRejectedValue(error);
      mockRequest.params = { id };
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user (Happy Path)', async () => {
      // Arrange
      const id = '1';
      mockRequest.params = { id };

      const userMock = { id, destroy: jest.fn().mockResolvedValue(true) };
      (User.findByPk as jest.Mock).mockResolvedValue(userMock);

      // Act
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

      expect(cacheService.del).toHaveBeenCalledWith('users:all');
    });

    it('should handle user not found during deletion (Error Handling)', async () => {
      // Arrange
      const id = '999';
      mockRequest.params = { id };
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('should handle database errors during deletion (Error Handling)', async () => {
      // Arrange
      const id = '1';
      mockRequest.params = { id };
      const error = new Error('Database Error');
      (User.findByPk as jest.Mock).mockRejectedValue(error);
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser Error Paths', () => {
    it('should handle database errors during creation (Error Handling)', async () => {
      const error = new Error('Database Error');
      (User.create as jest.Mock).mockRejectedValue(error);
      mockRequest.body = { name: 'Alice', email: 'alice@example.com' };
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser Error Paths', () => {
    it('should handle database errors during update (Error Handling)', async () => {
      const id = '1';
      const error = new Error('Database Error');
      const userMock = { id, update: jest.fn().mockRejectedValue(error) };
      (User.findByPk as jest.Mock).mockResolvedValue(userMock);
      mockRequest.params = { id };
      mockRequest.body = { name: 'Bob' };
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
