import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { AuthType } from '../entities/auth-method.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FindByAuthDto {
  @ApiProperty({ enum: AuthType, description: 'Authentication type, e.g., web3, google, github' })
  @IsEnum(AuthType, {
    message: 'auth_type must be one of: web3, google, github'
  })
  @IsNotEmpty({
    message: 'auth_type is required'
  })
  auth_type: AuthType;

  @ApiProperty({ type: String, description: 'Unique identifier for the auth method' })
  @IsString({
    message: 'auth_identifier must be a string'
  })
  @IsNotEmpty({
    message: 'auth_identifier is required'
  })
  auth_identifier: string;
}