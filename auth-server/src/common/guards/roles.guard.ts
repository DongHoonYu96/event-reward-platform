import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride(
            ROLES_KEY,
            [
            context.getHandler(),
            context.getClass(),
            ],
        );

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if(!user){
            throw new UnauthorizedException('토큰을 제공 해주세요!');
        }

        console.log(user.role);
        console.log(requiredRoles);
        if (!requiredRoles.includes(user.role)) {
            console.log(`user.role: ${user.role}, requiredRoles: ${requiredRoles}`);

            console.log(!requiredRoles.includes(user.role));
            throw new UnauthorizedException(
                `이 작업을 수행할 권한이 없습니다. ${requiredRoles} 권한이 필요합니다.`,
            );
        }

        return true;
    }
}