import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
  @IsNotEmpty()
  readonly otp: string;

  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly newPassword: string;
}
