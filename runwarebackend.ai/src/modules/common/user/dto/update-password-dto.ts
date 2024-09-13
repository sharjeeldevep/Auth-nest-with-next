import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  public currentPassword: string;

  @IsNotEmpty()
  public newPassword: string;

  @IsNotEmpty()
  public confirmNewPassword: string;
}
