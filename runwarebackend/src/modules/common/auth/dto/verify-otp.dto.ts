import { IsNotEmpty } from 'class-validator';

export class VerifyOtpDTO {
  @IsNotEmpty()
  readonly otp: string;

  @IsNotEmpty()
  readonly phoneNumber: string;
}
