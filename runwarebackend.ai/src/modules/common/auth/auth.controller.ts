import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CoachSignupDTO, SignupDTO } from './dto/signup.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { JwtGuard } from '../../../common/guards/jwt-guards';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import compileEmailTemplate from '../../../common/services/compile-email.service';
import { Permissions } from '../../../common/decorators/roles.decorator';
import { ALLOWED_USER_ROLE } from '../user/user.constants';
import { RolesGuard } from '../../../common/guards/roles.guards';
import { RolesService } from '../roles/roles.service';
import { QueueJobsService } from '../queue-jobs/queue-jobs.service';
import {
  QUEUE_JOB_STATUS,
  QUEUE_JOB_TYPE,
} from '../queue-jobs/queue-jobs.constants';
import { UserProfileService } from '../user-profile/user-profile.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userRepository: UserRepository) {}

  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(RolesService)
  private readonly rolesService: RolesService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(UserProfileService)
  private readonly profileService: UserProfileService;

  @Inject(QueueJobsService)
  public queueJobService: QueueJobsService;

  @UseGuards(JwtGuard, RolesGuard)
  @Permissions('users.create')
  @Post('admin/signup')
  async adminSignup(@Req() request, @Body() signupDTO: SignupDTO) {
    const existingUser = await this.userService.findOne({
      email: signupDTO.email,
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const role = signupDTO.role.toLowerCase().toString();

    const roleData = await this.rolesService.findOne(
      {
        name: role,
      },
      {
        searchFields: [],
        numericFields: [],
        objectIdFields: [],
        stringFields: [],
      },
      true,
      'key-role-name-' + role,
    );

    if (roleData == null) {
      throw new BadRequestException('Role does not found.');
    }

    if (ALLOWED_USER_ROLE.findIndex((item) => item === role) < 0) {
      if (
        !(await this.rolesService.checkPermissions(
          ['users.admincreate'],
          request.user,
        ))
      ) {
        throw new BadRequestException('Insufficient Roles rolesService Test');
      }
    }

    const { data } = await this.userService.create({
      ...signupDTO,
      emailVerificationToken: await this.authService.generateOtp(),
      role: roleData._id,
    });

    const encodedLink = this.authService.encodeLink({
      token: data.emailVerificationToken,
      email: data.email,
    });

    const link = this.authService.generateEncodedLink(
      'http://example.com',
      encodedLink,
    );

    const welcomeEmail = await compileEmailTemplate({
      fileName: 'welcome-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    const confirmEmailTemplate = await compileEmailTemplate({
      fileName: 'confirm-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
        link,
      },
    });

    await this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: welcomeEmail,
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
        subject: 'Welcome Email',
      },
    });

    await this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: confirmEmailTemplate,
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
        subject: 'Confirm your email address',
      },
    });

    return new ApiResponseDto('Signup Successful');
  }

  @Post('signup')
  async signup(@Body() signupDTO: SignupDTO) {
    const existingUser = await this.userService.findOne({
      email: signupDTO.email,
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const role = signupDTO.role.toLowerCase().toString();

    if (ALLOWED_USER_ROLE.findIndex((item) => item === role) < 0) {
      throw new BadRequestException('Insufficient Roles');
    }

    const roleData = await this.rolesService.findOne(
      {
        name: role,
      },
      {
        searchFields: [],
        numericFields: [],
        objectIdFields: [],
        stringFields: [],
      },
      false,
      'key-role-name-' + role,
    );

    if (roleData == null) {
      if (role == 'user') {
        await this.rolesService.setupRoles();
      }

      throw new BadRequestException('Role does not found.');
    }

    const { data } = await this.userService.create({
      ...signupDTO,
      emailVerificationToken: await this.authService.generateOtp(),
      role: roleData._id,
    });

    // return new ApiResponseDto('Signup Successful');
    const welcomeEmail = await compileEmailTemplate({
      fileName: 'welcome-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    const confirmEmailTemplate = await compileEmailTemplate({
      fileName: 'confirm-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    await this.queueJobService.createBulk([
      {
        type: QUEUE_JOB_TYPE.EMAIL,
        maxRetries: 5,
        attempts: 0,
        status: QUEUE_JOB_STATUS.PENDING,
        data: {
          template: welcomeEmail,
          name: data.name,
          email: data.email,
          code: data.emailVerificationToken,
          subject: 'Welcome Email',
        },
      },
      {
        type: QUEUE_JOB_TYPE.EMAIL,
        maxRetries: 5,
        attempts: 0,
        status: QUEUE_JOB_STATUS.PENDING,
        data: {
          template: confirmEmailTemplate,
          name: data.name,
          email: data.email,
          code: data.emailVerificationToken,
          subject: 'Confirm your email address',
        },
      },
    ]);

    const token = await this.authService.createToken(data);

    return new ApiResponseDto('Signup Successful', { api_token: token }, null);
  }

  @UseGuards(JwtGuard)
  @Get('verify-token')
  async verifyToken(@Req() req) {
    const userDetails = req.user;
    const roles = req.user.role;

    const rolesResponse = await this.rolesService.findById(
      { _id: roles },
      {},
      {
        searchFields: [],
        numericFields: [],
        objectIdFields: [],
        stringFields: [],
      },
      false,
      'key-role-id-' + roles,
      parseInt(process.env.DEFAULT_CACHE_TIME),
    );

    const profiles = await this.profileService.findAll({
      user: userDetails._id,
      populateFields: {
        path: 'role',
      },
    });

    userDetails.role = rolesResponse;

    return new ApiResponseDto('Login Successful', {
      user: userDetails,
      profile: profiles.data,
    });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    const user = await this.userService.findOne({
      email: forgotPasswordDto.email,
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const otp = await this.authService.generateOtp();
    user.passwordResetToken = otp;
    user.passwordResetTokenExpiresAt = Date.now() + 30 * 60 * 1000;
    this.userService.findByIdAndUpdate(user._id, user);

    const code = otp.toString();

    const template = await compileEmailTemplate({
      fileName: 'reset-password.mjml',
      data: {
        name: user.name,
        email: user.email,
        code: code,
      },
    });

    await this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: template,
        name: user.name,
        email: user.email,
        code: code,
        subject: 'Reset Your Password',
      },
    });

    return new ApiResponseDto('OTP Generated');
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
    const user = await this.userService.findOne({
      email: verifyEmailDto.email,
      emailVerificationToken: verifyEmailDto.otp,
    });

    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    if (Date.now() > user.emailVerificationTokenExpiresAt) {
      throw new BadRequestException('OTP Expired');
    }

    await this.userService.updateOne(
      {
        email: verifyEmailDto.email,
      },
      {
        emailVerified: true,
      },
      {
        new: true,
      },
    );

    return new ApiResponseDto('Email Verified', {}, null);
  }

  @Post('generate-verify-email-otp')
  async generateVerifyEmailOTP(@Body() verifyEmailDto: ForgotPasswordDTO) {
    const user = await this.userService.findOne({
      email: verifyEmailDto.email,
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const { data } = await this.userService.findByIdAndUpdate(user._id, {
      emailVerificationToken: await this.authService.generateOtp(),
      emailVerificationTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    });

    const confirmEmailTemplate = await compileEmailTemplate({
      fileName: 'confirm-email.mjml',
      data: {
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
      },
    });

    await this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: confirmEmailTemplate,
        name: data.name,
        email: data.email,
        code: data.emailVerificationToken,
        subject: 'Confirm your email address',
      },
    });

    return new ApiResponseDto(
      'Email Verification Token Sent , Check Your Email',
      {},
      null,
    );
  }

  @Post('verify-password-otp')
  async verifyResetPasswordCode(@Body() verifyEmailDto: VerifyEmailDTO) {
    const user = await this.userService.findOne({
      email: verifyEmailDto.email,
      passwordResetToken: verifyEmailDto.otp,
    });

    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    return new ApiResponseDto('OTP Verified', {}, null);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    const user = await this.userService.findOne({
      email: resetPasswordDTO.email,
      otp: resetPasswordDTO.otp,
    });

    if (!user) {
      throw new BadRequestException("User with this email doesn't exist");
    }

    if (Date.now() > user.passwordResetTokenExpiresAt) {
      throw new BadRequestException('OTP Expired');
    }

    user.password = await bcrypt.hash(resetPasswordDTO.newPassword, 12);
    await this.userService.findByIdAndUpdate(user._id, user);
    return new ApiResponseDto('Password Reset Successful', {}, null, false);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    const user = await this.userService.findOne({
      email: loginDTO.email,
      isLoginEnabled: true,
      fields: 'password,emailVerified',
    });

    if (
      !user ||
      !(await this.authService.comparePassword(
        loginDTO.password,
        user.password,
      ))
    ) {
      throw new HttpException('Incorrect Credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.authService.createToken(user);

    return new ApiResponseDto('Login Successful', { api_token: token }, null);
  }
}
