import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { AuthType } from '../entities/auth-method.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  reward_address?: string;

  @IsEnum(AuthType)
  auth_type: AuthType;

  @IsString()
  auth_identifier: string;
}
