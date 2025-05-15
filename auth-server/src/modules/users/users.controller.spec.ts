// auth-server/src/modules/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        create: jest.fn(),
        login: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            // Arrange
            const createUserDto: CreateUserDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.USER,
            };

            const createdUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                role: UserRole.USER,
            };

            mockUsersService.create.mockResolvedValue(createdUser);

            // Act
            const result = await controller.register(createUserDto);

            // Assert
            expect(service.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(createdUser);
        });
    });

    describe('login', () => {
        it('should login a user and return an access token', async () => {
            // Arrange
            const loginUserDto: LoginUserDto = {
                username: 'testuser',
                password: 'password123',
            };

            const loginResponse = {
                accessToken: 'test-token',
            };

            mockUsersService.login.mockResolvedValue(loginResponse);

            // Act
            const result = await controller.login(loginUserDto);

            // Assert
            expect(service.login).toHaveBeenCalledWith(loginUserDto);
            expect(result).toEqual(loginResponse);
        });
    });

    describe('getProfile', () => {
        it('should return the user profile', async () => {
            // Arrange
            const req = {
                user: {
                    userId: 'user-id',
                },
            };

            const userProfile = {
                _id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                role: UserRole.USER,
            };

            mockUsersService.findOne.mockResolvedValue(userProfile);

            // Act
            const result = await controller.getProfile(req);

            // Assert
            expect(service.findOne).toHaveBeenCalledWith(req.user.userId);
            expect(result).toEqual(userProfile);
        });
    });
});