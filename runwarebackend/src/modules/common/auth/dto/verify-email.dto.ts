import { IsNotEmpty } from 'class-validator';

export class VerifyEmailDTO {
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly otp: string;
}
