import { SetMetadata } from '@nestjs/common';

export enum UserRole {
    USER = 'USER',
    OPERATOR = 'OPERATOR',
    AUDITOR = 'AUDITOR',
    ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);