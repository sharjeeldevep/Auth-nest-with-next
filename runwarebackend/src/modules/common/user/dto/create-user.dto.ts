import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public phoneNumber: number;
}
