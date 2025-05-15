import {Injectable, ExecutionContext, UnauthorizedException, Logger} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {Reflector} from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {

        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException('인증에 실패했습니다.');
        }
        return user;
    }
}