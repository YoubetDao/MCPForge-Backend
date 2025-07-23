import { Controller, Get, UseGuards } from '@nestjs/common';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionPayload, AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('me')
  @UseGuards(CookieAuthGuard)
  getCurrentUser(@CurrentUser() user: SessionPayload) {
    return {
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
      message: 'User authenticated successfully',
    };
  }

  @Get('bearer-token')
  @UseGuards(CookieAuthGuard)
  async getBearerToken(@CurrentUser() user: SessionPayload) {
    // 获取完整的用户信息
    const fullUser = await this.userService.findOne(user.userId);

    // 生成Bearer Token
    const bearerToken = await this.authService.generateBearerToken(fullUser);

    return {
      success: true,
      bearer_token: bearerToken,
      expires_in: '7d',
      message: 'Bearer token generated successfully. Use this token in Authorization header: Bearer <token>',
    };
  }

  @Get('status')
  getAuthStatus() {
    return {
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
