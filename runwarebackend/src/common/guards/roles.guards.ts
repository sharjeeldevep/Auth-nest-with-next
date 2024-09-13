import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../modules/common/roles/roles.service';
import { Role } from 'modules/common/roles/entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredRoles && !requiredPermissions) {
      return true; // No specific roles or permissions required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const userRoles: string[] = request.user?.permissions || [];

    if (
      requiredRoles &&
      !this.roleService.checkRoles(userRoles, requiredRoles)
    ) {
      throw new ForbiddenException('Insufficient Roles');
    }

    if (requiredPermissions) {
      const userPermissions: string[] = request.user?.permissions || [];
      if (
        !this.roleService.checkPermissionsArray(
          userPermissions,
          requiredPermissions,
        )
      ) {
        // If not found in user's permissions, check in role's permissions
        const role: Role = await this.roleService.findById(
          { _id: request.user?.role },
          {},
          {
            searchFields: [],
            numericFields: [],
            objectIdFields: [],
            stringFields: [],
          },
          false,
          'key-role-id-' + request.user?.role,
          parseInt(process.env.DEFAULT_CACHE_TIME),
        );

        if (
          role &&
          role.permissions &&
          this.roleService.checkPermissionsArray(
            Object.keys(role?.permissions),
            requiredPermissions,
          )
        ) {
          return true;
        }

        throw new ForbiddenException('Insufficient Permissions');
      }
    }

    if (requiredPermissions) {
      if (
        this.roleService.checkPermissions(requiredPermissions, request.user)
      ) {
        return true;
      }
      throw new ForbiddenException('Insufficient Permissions');
    }
    return true;
  }
}
