import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthType } from '../entities/auth-method.entity';

export class BindAuthMethodDto {
  @ApiProperty({ enum: AuthType })
  @IsEnum(AuthType)
  auth_type: AuthType;

  @ApiProperty({ type: String })
  @IsString()
  auth_identifier: string;
}