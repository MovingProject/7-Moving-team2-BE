import { IsOptional, IsString, IsEmail,MinLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}


export class UpdateUserPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
