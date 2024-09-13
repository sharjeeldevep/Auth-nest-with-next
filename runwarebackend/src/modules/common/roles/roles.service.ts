import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoGenericService } from '../../../common/services/mongo-generic.service';
import { RoleRepository } from './roles.repository';
import { GenericMutationResponseDto } from 'common/dtos/mutation-api-response.dto';

@Injectable()
export class RolesService extends MongoGenericService {
  constructor(private readonly roleRepository: RoleRepository) {
    super(roleRepository);
  }

  async checkPermissions(requiredPermissions: string[], user = null) {
    if (requiredPermissions && user != null) {
      const userPermissions: string[] = user?.permissions || [];
      if (!this.checkPermissionsArray(userPermissions, requiredPermissions)) {
        const role = await this.findById(
          { _id: user?.role },
          {},
          {
            searchFields: [],
            numericFields: [],
            objectIdFields: [],
            stringFields: [],
          },
          true,
          'key-role-id-' + user?.role,
        );
        if (
          role &&
          role.permissions &&
          this.checkPermissionsArray(
            Object.keys(role.permissions),
            requiredPermissions,
          )
        ) {
          return true;
        }
        throw new BadRequestException('Insufficient Roles Permission');
      }
    }
  }

  async setupRoles() {
    return await this.createBulk([
      {
        name: 'admin',
        permissions: [
          'users.view',
          'users.add',
          'users.update',
          'users.create',
          'users.admincreate',
          'products.view',
          'products.add',
          'products.create',
          'products.admincreate',
          'assessment.view',
          'assessment.add',
          'assessment.create',
          'assessment.admincreate',
        ],
        isDeleted: false,
      },
      {
        name: 'user',
        permissions: ['users.view', 'users.update'],
        isDeleted: false,
      },
    ]);
  }

  checkPermissionsArray(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  checkRoles(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.every((role) => userRoles.includes(role));
  }
}
