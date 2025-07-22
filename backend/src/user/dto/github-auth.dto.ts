import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GitHubAuthDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;
}

export class GitHubAuthResponseDto {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ type: [Object] })
  auth_methods: any[];

  @ApiProperty({ required: false, description: 'JWT token for the user session' })
  access_token?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}