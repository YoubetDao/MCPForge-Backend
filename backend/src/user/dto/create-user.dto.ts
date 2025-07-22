import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { AuthType } from '../entities/auth-method.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reward_address?: string;

  @ApiProperty({ enum: AuthType })
  @IsEnum(AuthType)
  auth_type: AuthType;

  @ApiProperty()
  @IsString()
  auth_identifier: string;
}
