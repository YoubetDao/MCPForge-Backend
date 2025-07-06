import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { AuthType } from '../entities/auth-method.entity';

export class FindByAuthDto {
  @IsEnum(AuthType, {
    message: 'auth_type must be one of: web3, google, github'
  })
  @IsNotEmpty({
    message: 'auth_type is required'
  })
  auth_type: AuthType;

  @IsString({
    message: 'auth_identifier must be a string'
  })
  @IsNotEmpty({
    message: 'auth_identifier is required'
  })
  auth_identifier: string;
} 