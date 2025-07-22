import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Web3ChallengeDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  address: string;
}

export class Web3ChallengeResponseDto {
  @ApiProperty()
  nonce: string;

  @ApiProperty()
  expires_at: string;
}