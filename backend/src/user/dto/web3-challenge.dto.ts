import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class Web3ChallengeDto {
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  address: string;
}

export class Web3ChallengeResponseDto {
  nonce: string;
  expires_at: string;
}