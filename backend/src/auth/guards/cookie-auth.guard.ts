import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, SessionPayload } from '../auth.service';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 从Cookie中获取认证token
    const token = this.extractTokenFromCookies(request);
    
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      // 验证token并获取用户信息
      const payload = await this.authService.validateSession(token);
      
      if (!payload) {
        throw new UnauthorizedException('Invalid session');
      }

      // 将用户信息附加到请求对象
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    // 使用cookie-parser中间件解析的cookies
    if (request.cookies && request.cookies['auth-session']) {
      return request.cookies['auth-session'];
    }

    // 手动解析Cookie头（备用方案）
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = this.authService.parseCookies(cookieHeader);
      return cookies['auth-session'];
    }

    return undefined;
  }
}
