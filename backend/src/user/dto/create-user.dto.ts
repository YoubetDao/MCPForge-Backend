import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  github_id: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  github_url?: string;

  @IsOptional()
  @IsObject()
  github_data?: Record<string, any>;
}
