import { IsNotEmpty } from 'class-validator';

export class SignupDTO {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly role: string;
}

export class CoachSignupDTO {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  readonly phone: string;

  @IsNotEmpty()
  readonly taxFileNumber: string;

  @IsNotEmpty()
  readonly australianBusinessNumber: string;

  @IsNotEmpty()
  readonly bankName: string;

  @IsNotEmpty()
  readonly bsb: string;

  @IsNotEmpty()
  readonly accountNumber: string;
}
