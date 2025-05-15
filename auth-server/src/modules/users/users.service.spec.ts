// auth-server/src/modules/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// bcrypt 모킹
jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let jwtService: JwtService;
    let userModel: any;

    const mockUserModel = {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        exec: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(() => 'test-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        userModel = module.get(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            // Arrange
            const createUserDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.USER,
            };

            const hashedPassword = 'hashed-password';

            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            mockUserModel.findOne.mockResolvedValue(null);

            const newUser = {
                ...createUserDto,
                password: hashedPassword,
                _id: 'user-id',
                save: jest.fn().mockResolvedValue({
                    _id: 'user-id',
                    username: createUserDto.username,
                    email: createUserDto.email,
                    role: createUserDto.role,
                }),
            };

            mockUserModel.create.mockReturnValue(newUser);

            // Act
            const result = await service.create(createUserDto);

            // Assert
            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                $or: [
                    { username: createUserDto.username },
                    { email: createUserDto.email },
                ],
            });
            expect(bcrypt.genSalt).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
            expect(mockUserModel.create).toHaveBeenCalledWith({
                username: createUserDto.username,
                email: createUserDto.email,
                password: hashedPassword,
                role: createUserDto.role,
            });
            expect(result).toEqual({
                _id: 'user-id',
                username: createUserDto.username,
                email: createUserDto.email,
                role: createUserDto.role,
            });
        });

        it('should throw ConflictException when username or email already exists', async () => {
            // Arrange
            const createUserDto = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
                role: UserRole.USER,
            };

            mockUserModel.findOne.mockResolvedValue({ username: 'existinguser' });

            // Act & Assert
            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                $or: [
                    { username: createUserDto.username },
                    { email: createUserDto.email },
                ],
            });
        });
    });

    describe('login', () => {
        it('should return JWT token when credentials are valid', async () => {
            // Arrange
            const loginUserDto = {
                username: 'testuser',
                password: 'password123',
            };

            const user = {
                _id: 'user-id',
                username: 'testuser',
                password: 'hashed-password',
                role: UserRole.USER,
            };

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await service.login(loginUserDto);

            // Assert
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: loginUserDto.username });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginUserDto.password, user.password);
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: user._id,
                username: user.username,
                roles: [user.role],
            });
            expect(result).toEqual({ accessToken: 'test-token' });
        });

        it('should throw UnauthorizedException when user does not exist', async () => {
            // Arrange
            const loginUserDto = {
                username: 'nonexistentuser',
                password: 'password123',
            };

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            // Act & Assert
            await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: loginUserDto.username });
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            // Arrange
            const loginUserDto = {
                username: 'testuser',
                password: 'wrongpassword',
            };

            const user = {
                _id: 'user-id',
                username: 'testuser',
                password: 'hashed-password',
                role: UserRole.USER,
            };

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: loginUserDto.username });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginUserDto.password, user.password);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            // Arrange
            const userId = 'user-id';
            const user = {
                _id: userId,
                username: 'testuser',
                email: 'test@example.com',
                role: UserRole.USER,
            };

            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });

            // Act
            const result = await service.findOne(userId);

            // Assert
            expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(user);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            // Arrange
            const userId = 'nonexistent-id';

            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            // Act & Assert
            await expect(service.findOne(userId)).rejects.toThrow();
            expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
        });
    });
});