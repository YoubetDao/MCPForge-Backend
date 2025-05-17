import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // @Get('github/login')
  // githubLogin(@Res() res: Response) {
  //   const clientId = this.configService.get('GITHUB_CLIENT_ID');
  //   const redirectUri = this.configService.get('GITHUB_CALLBACK_URL');

  //   const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;

  //   res.redirect(githubAuthUrl);
  // }

  // @Get('github/callback')
  // async githubCallback(@Query('code') code: string, @Res() res: Response) {
  //   try {
  //     if (!code) {
  //       throw new HttpException('No code provided', HttpStatus.BAD_REQUEST);
  //     }

  //     const user = await this.userService.handleGithubCallback(code);

  //     // 这里可以生成 JWT token 或其他认证方式
  //     // 然后将用户重定向到前端，带上认证信息
  //     const frontendUrl = this.configService.get('FRONTEND_URL');
  //     res.redirect(`${frontendUrl}/auth/callback?token=${user.id}`);
  //   } catch (error) {
  //     throw new HttpException(
  //       `GitHub authentication failed: ${error.message}`,
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  // }
}
