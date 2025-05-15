// auth-server/src/common/guards/roles.guard.spec.ts
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../modules/users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);

        // 모킹된 ExecutionContext 생성
        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: {
                        userId: 'user-id',
                        username: 'testuser',
                        roles: [UserRole.USER], // 기본 역할
                    },
                }),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should allow access when no roles are required', () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                mockExecutionContext.getHandler(),
                mockExecutionContext.getClass(),
            ]);
            expect(result).toBe(true);
        });

        it('should allow access when user has required role', () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.USER]);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should deny access when user does not have required role', () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
        });

        it('should allow access when user has one of the required roles', () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.USER]);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should deny access when user is not authenticated', () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.USER]);

            // 인증되지 않은 요청 모킹
            const nonAuthContext = {
                ...mockExecutionContext,
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: undefined, // 사용자 정보 없음
                    }),
                }),
            } as unknown as ExecutionContext;

            // Act & Assert
            expect(() => guard.canActivate(nonAuthContext)).toThrow(ForbiddenException);
        });
    });
});