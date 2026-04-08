import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { UserController } from '@/interfaces/controllers/userController';
import CreateUser from '@/usecases/createUser';
import GetAllUsers from '@/usecases/getAllUsers';
import UpdateUser from '@/usecases/updateUser';
import DeleteUser from '@/usecases/deleteUser';

// Mock dependencies
jest.mock('@/infrastructure/repositories/UserRepository');
jest.mock('@/usecases/createUser');
jest.mock('@/usecases/getAllUsers');
jest.mock('@/usecases/updateUser');
jest.mock('@/usecases/deleteUser');
jest.mock('@/infrastructure/log/logger');
jest.mock('@/infrastructure/messaging/kafkaClient', () => ({
  kafkaService: {
    sendMessage: jest.fn().mockResolvedValue(undefined),
  },
  KafkaService: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn().mockResolvedValue(undefined),
  })),
}));
const { kafkaService } = require('@/infrastructure/messaging/kafkaClient');

describe('UserController (Clean Architecture)', () => {
  let userController: UserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUser>;
  let mockGetAllUsersUseCase: jest.Mocked<GetAllUsers>;
  let mockUpdateUserUseCase: jest.Mocked<UpdateUser>;
  let mockDeleteUserUseCase: jest.Mocked<DeleteUser>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Clear all mocks
    jest.resetAllMocks();

    userController = new UserController();

    // Retrieve the mocked instances created inside UserController constructor
    mockCreateUserUseCase = (CreateUser as jest.Mock).mock.instances[0] as jest.Mocked<CreateUser>;
    mockGetAllUsersUseCase = (GetAllUsers as jest.Mock).mock
      .instances[0] as jest.Mocked<GetAllUsers>;
    mockUpdateUserUseCase = (UpdateUser as jest.Mock).mock.instances[0] as jest.Mocked<UpdateUser>;
    mockDeleteUserUseCase = (DeleteUser as jest.Mock).mock.instances[0] as jest.Mocked<DeleteUser>;

    mockRequest = {
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getUsers', () => {
    it('should return successfully (Happy Path)', async () => {
      // Arrange
      const usersMock = [{ id: '1', name: 'Test', email: 'test@example.com' }];
      mockGetAllUsersUseCase.execute.mockResolvedValue(usersMock);

      // Act
      await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(usersMock);
      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalled();
    });

    it('should handle errors correctly (Error Handling)', async () => {
      // Arrange
      const error = new Error('UseCase Error');
      mockGetAllUsersUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle non-Error objects in catch block', async () => {
      // Arrange
      const error = 'String Error';
      mockGetAllUsersUseCase.execute.mockRejectedValue(error);

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

      mockCreateUserUseCase.execute.mockResolvedValue(expectedUser);

      // Act
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      const { kafkaService } = require('@/infrastructure/messaging/kafkaClient');
      expect(kafkaService.sendMessage).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);

      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(payload.name, payload.email);
    });

    it('should handle errors when creation fails (Error Handling)', async () => {
      // Arrange
      const error = new Error('Creation Error');
      const payload = { name: 'Bob', email: 'bob@example.com' };
      mockRequest.body = payload;

      mockCreateUserUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle non-Error objects in catch block when creation fails', async () => {
      // Arrange
      const error = 'Creation String Error';
      const payload = { name: 'Bob', email: 'bob@example.com' };
      mockRequest.body = payload;

      mockCreateUserUseCase.execute.mockRejectedValue(error);

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
      const expectedUser = { id, name: 'Alice Updated', email: 'alice@example.com' };

      mockUpdateUserUseCase.execute.mockResolvedValue(expectedUser as any);

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);

      const { kafkaService } = require('@/infrastructure/messaging/kafkaClient');
      expect(kafkaService.sendMessage).toHaveBeenCalled();
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(id, payload);
    });

    it('should handle 404/errors when user not found or update fails', async () => {
      // Arrange
      const id = '999';
      mockRequest.params = { id };
      mockRequest.body = { name: 'Fail' };
      mockUpdateUserUseCase.execute.mockResolvedValue(null);

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('should handle database errors during update (Error Handling)', async () => {
      // Arrange
      const id = '1';
      const error = new Error('Database Error');
      mockUpdateUserUseCase.execute.mockRejectedValue(error);
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
      mockDeleteUserUseCase.execute.mockResolvedValue(true);

      // Act
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

      const { kafkaService } = require('@/infrastructure/messaging/kafkaClient');
      expect(kafkaService.sendMessage).toHaveBeenCalled();
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(id);
    });

    it('should throw error if user not found during deletion (Error Handling)', async () => {
      // Arrange
      const id = '999';
      mockRequest.params = { id };
      mockDeleteUserUseCase.execute.mockResolvedValue(false);
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('should handle database errors during deletion (Error Handling)', async () => {
      // Arrange
      const id = '1';
      const error = new Error('Database Error');
      mockDeleteUserUseCase.execute.mockRejectedValue(error);
      mockRequest.params = { id };
      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser Error Paths', () => {
    it('should handle database errors during creation (Error Handling)', async () => {
      const error = new Error('Database Error');
      mockCreateUserUseCase.execute.mockRejectedValue(error);
      mockRequest.body = { name: 'Alice', email: 'alice@example.com' };
      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
