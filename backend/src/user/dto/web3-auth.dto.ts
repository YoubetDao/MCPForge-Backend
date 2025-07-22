import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class Web3AuthDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  address: string;

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsString()
  nonce: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username?: string;

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
  @Transform(({ value }) => value?.toLowerCase())
  reward_address?: string;
}

class Web3AuthUser {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  reward_address?: string;

  @ApiProperty({ type: [Object] })
  auth_methods: any[];

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class Web3AuthResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: Web3AuthUser })
  user: Web3AuthUser;

  @ApiProperty()
  message: string;
}