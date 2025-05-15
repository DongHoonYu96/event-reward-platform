// auth-server/src/common/guards/jwt-auth.guard.spec.ts
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new JwtAuthGuard(reflector);

        // 모킹된 ExecutionContext 생성
        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: undefined, // 초기 값은 undefined
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
        it('should allow access for public routes', async () => {
            // Arrange
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // isPublic 메타데이터 반환

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockExecutionContext.getHandler(),
                mockExecutionContext.getClass(),
            ]);
            expect(result).toBe(true);
        });

        // 추가 canActivate 테스트는 JWT 전략과 깊게 연관되어 있어
        // 완전한 테스트를 위해서는 더 복잡한 모킹이 필요합니다.
    });

    describe('handleRequest', () => {
        it('should return user when user exists and no error', () => {
            // Arrange
            const mockUser = { userId: 'user-id', username: 'testuser' };

            // Act
            const result = guard.handleRequest(null, mockUser, null);

            // Assert
            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException when user does not exist', () => {
            // Act & Assert
            expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
        });

        it('should throw original error when error exists', () => {
            // Arrange
            const mockError = new Error('Test error');

            // Act & Assert
            expect(() => guard.handleRequest(mockError, null, null)).toThrow(mockError);
        });
    });
});