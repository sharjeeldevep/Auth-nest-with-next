import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { EmailService } from '../../../common/services/email.service';
import { JwtGuard } from '../../../common/guards/jwt-guards';

import { Permissions } from '../../../common/decorators/roles.decorator';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password-dto';

import { RolesService } from '../roles/roles.service';

import * as bcrypt from 'bcrypt';
import { RolesGuard } from 'common/guards/roles.guards';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(RolesService)
  private readonly rolesService: RolesService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @UseGuards(JwtGuard)
  @Permissions('users.view')
  @Get('')
  async getAll(@Req() request, @Query() params) {
    const filters = await this.userService.roleBaseFilters(params.role);

    const roleData = await this.rolesService.findOne(
      {
        name: params.role,
      },
      {
        searchFields: [],
        numericFields: [],
        objectIdFields: [],
        stringFields: [],
      },
      true,
      'key-role-name-' + params.role,
    );
    if (roleData == null) {
      throw new BadRequestException('Role does not found.');
    }
    return await this.userService.findAll({
      role: roleData._id,
    });
  }

  @Get('who-am-i')
  async whoAmI(@Query() params) {
    return await this.userService.findAll(params);
  }

  @UseGuards(JwtGuard)
  @Patch('update-password')
  async updatePassword(
    @Req() request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.userService.findOne({
      _id: request.user.id,
      fields: 'password',
    });

    if (
      !user ||
      !(await this.authService.comparePassword(
        updatePasswordDto.currentPassword,
        user.password,
      ))
    ) {
      throw new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED);
    }

    if (
      !(updatePasswordDto.confirmNewPassword === updatePasswordDto.newPassword)
    ) {
      throw new BadRequestException("Passwords Doesn't Match");
    }

    user.password = await bcrypt.hash(updatePasswordDto.newPassword, 12);
    return this.userService.findByIdAndUpdate(request.user._id, user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permissions('users.delete')
  @Delete(':id')
  async delete(@Req() request, @Param('id') id: string) {
    return await this.userService.softDelete(id);
  }
}
