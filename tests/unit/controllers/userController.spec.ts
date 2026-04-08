import { HTTP_STATUS } from '@/utils/httpCodes';
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { UserController } from '@/controllers/userController';

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
        mockData: []
    };
});
const User = require('@/models/User');
jest.mock('@/utils/logger');


describe('UserController', () => {
    let userController: UserController;

    beforeEach(() => {
        userController = new UserController();
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
            const result = await userController.getUsers();

            // Assert
            expect(result!).toEqual(usersMock);
            expect(User.findAll).toHaveBeenCalled();
        });

        it('should return an empty array when no users found', async () => {
            // Arrange
            const usersMock: any[] = [];
            (User.findAll as jest.Mock).mockResolvedValue(usersMock);

            // Act
            const result = await userController.getUsers();

            // Assert
            expect(result!).toEqual(usersMock);
        });

        it('should handle errors correctly (Error Handling)', async () => {
            // Arrange
            const error = new Error('Database Error');
            (User.findAll as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(userController.getUsers()).rejects.toThrow(error);
        });
    });

    describe('createUser', () => {
        it('should successfully create a new user (Happy Path)', async () => {
            // Arrange
            const payload = { name: 'Alice', email: 'alice@example.com' };
            const dataArg = payload;
            
            const expectedUser = { id: '1', ...payload };
            (User.create as jest.Mock).mockResolvedValue(expectedUser);

            // Act
            const result = await userController.createUser(dataArg) as any;

            // Assert
            expect(result!).toEqual(expectedUser);
        });

        it('should handle errors when creation fails (Error Handling)', async () => {
            // Arrange
            const error = new Error('Creation Error');
            const payload = { name: 'Bob', email: 'bob@example.com' };
            const dataArg = payload;

            (User.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(userController.createUser(dataArg)).rejects.toThrow(error);
        });
    });

    describe('updateUser', () => {
        it('should successfully update a user (Happy Path)', async () => {
            // Arrange
            const id = '1';
            const payload = { name: 'Alice Updated' };
            const idArg = id;
            const dataArg = payload;
            
            const expectedUser = { id, ...payload, email: 'alice@example.com' };
            const userMock = { ...expectedUser, update: jest.fn().mockResolvedValue(true) };
            (User.findByPk as jest.Mock).mockResolvedValue(userMock);

            // Act
            const result = await userController.updateUser(idArg, dataArg);

            // Assert
            expect(result!).toMatchObject(payload);
            expect(User.findByPk).toHaveBeenCalledWith(id);
        });

        it('should handle 404/errors when user not found or update fails', async () => {
             // Arrange
            const id = '999';
            const idArg = id;
            const dataArg = { name: 'Fail' };
            (User.findByPk as jest.Mock).mockResolvedValue(null);
            await expect(userController.updateUser(idArg, dataArg)).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
        });

        it('should handle database errors during update (Error Handling)', async () => {
            // Arrange
            const id = '1';
            const error = new Error('Database Error');
            (User.findByPk as jest.Mock).mockRejectedValue(error);
            await expect(userController.updateUser(id, { name: 'Fail' })).rejects.toThrow(error);
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete a user (Happy Path)', async () => {
            // Arrange
            const id = '1';
            const idArg = id;
            
            const userMock = { id, destroy: jest.fn().mockResolvedValue(true) };
            (User.findByPk as jest.Mock).mockResolvedValue(userMock);

            // Act
            const result = await userController.deleteUser(idArg);
            expect(result).toBe(true);

        });

        it('should handle user not found during deletion (Error Handling)', async () => {
            const id = '999';
            (User.findByPk as jest.Mock).mockResolvedValue(null);
            await expect(userController.deleteUser(id)).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
        });

        it('should handle database errors during deletion (Error Handling)', async () => {
            const id = '1';
            const error = new Error('Database Error');
            (User.findByPk as jest.Mock).mockRejectedValue(error);
            await expect(userController.deleteUser(id)).rejects.toThrow(error);
        });
    });

    describe('createUser Error Paths', () => {
        it('should handle database errors during creation (Error Handling)', async () => {
            const error = new Error('Database Error');
            (User.create as jest.Mock).mockRejectedValue(error);
            await expect(userController.createUser({ name: 'Alice', email: 'alice@example.com' })).rejects.toThrow(error);
        });
    });

    describe('updateUser Error Paths', () => {
        it('should handle database errors during update (Error Handling)', async () => {
            const id = '1';
            const error = new Error('Database Error');
            const userMock = { id, update: jest.fn().mockRejectedValue(error) };
            (User.findByPk as jest.Mock).mockResolvedValue(userMock);
            await expect(userController.updateUser(id, { name: 'Bob' })).rejects.toThrow(error);
        });
    });
});
