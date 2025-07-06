import { IsEnum, IsString } from 'class-validator';
import { AuthType } from '../entities/auth-method.entity';

export class BindAuthMethodDto {
  @IsEnum(AuthType)
  auth_type: AuthType;

  @IsString()
  auth_identifier: string;
} 