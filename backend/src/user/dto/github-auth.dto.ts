import { IsString, IsOptional } from 'class-validator';

export class GitHubAuthDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class GitHubAuthResponseDto {
  user_id: number;
  username: string;
  email?: string;
  role: string;
  auth_methods: any[];
  access_token?: string; // JWT token for the user session
  created_at: string;
  updated_at: string;
} 