import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
  @IsNotEmpty()
  readonly email: string;
}
