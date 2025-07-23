import { Controller, Get, UseGuards } from '@nestjs/common';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionPayload } from './auth.service';

@Controller('auth')
export class AuthController {
  
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

  @Get('status')
  getAuthStatus() {
    return {
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
