import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { MongoGenericService } from '../../../common/services/mongo-generic.service';

import * as bcrypt from 'bcrypt';

import { SignupDTO } from '../auth/dto/signup.dto';
import { RolesService } from '../roles/roles.service';
import { AuthService } from '../auth/auth.service';

import { UserRepository } from './user.repository';
import { USER_ROLE } from './user.constants';

@Injectable()
export class UserService extends MongoGenericService {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  @Inject(RolesService)
  private readonly rolesService: RolesService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  async roleBaseFilters(role: USER_ROLE) {
    switch (role) {
      case USER_ROLE.USER:
        return {};
      default:
        throw new BadRequestException('Invalid Roles');
    }
  }

  createUser = async (signupDTO: SignupDTO, isProfile: Boolean = false) => {
    const roleData = await this.rolesService.findOne(
      {
        name: 'user',
      },
      {
        searchFields: [],
        numericFields: [],
        objectIdFields: [],
        stringFields: [],
      },
      false,
      'key-role-name-user',
    );

    if (roleData == null) {
      throw new BadRequestException('Role does not found.');
    }

    const { data } = await this.create({
      ...signupDTO,
      emailVerificationToken: await this.authService.generateOtp(),
      password: await bcrypt.hash('dummy', 12),
      role: roleData._id,
      isLoginEnabled: false,
    });

    return data;
  };
}
