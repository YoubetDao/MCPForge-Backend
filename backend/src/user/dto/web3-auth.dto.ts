import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class Web3AuthDto {
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  address: string;

  @IsString()
  signature: string;

  @IsString()
  nonce: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  reward_address?: string;
}

export class Web3AuthResponseDto {
  success: boolean;
  user: {
    user_id: number;
    username: string;
    email?: string;
    role: string;
    reward_address?: string;
    auth_methods: any[];
    created_at: string;
    updated_at: string;
  };
  message: string;
}