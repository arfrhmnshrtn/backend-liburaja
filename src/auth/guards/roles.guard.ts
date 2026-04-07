import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
       throw new ForbiddenException('Akses ditolak: User tidak memiliki informasi role.');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
       throw new ForbiddenException(`Akses ditolak: Anda tidak memiliki izin untuk resource ini.`);
    }

    return true;
  }
}
