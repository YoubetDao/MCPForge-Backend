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

    // 尝试从多种方式获取token：Bearer Token 优先，然后是 Cookie
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required. Please provide a valid Bearer token or login cookie.');
    }

    try {
      // 验证token并获取用户信息
      const payload = await this.authService.validateSession(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid session or token');
      }

      // 将用户信息附加到请求对象
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session or token');
    }
  }

  /**
   * 从请求中提取token，支持多种方式：
   * 1. Authorization: Bearer <token>
   * 2. Cookie: auth-session=<token>
   */
  private extractTokenFromRequest(request: Request): string | undefined {
    // 1. 优先检查 Authorization Bearer Token
    const bearerToken = this.extractTokenFromBearer(request);
    if (bearerToken) {
      return bearerToken;
    }

    // 2. 然后检查 Cookie
    const cookieToken = this.extractTokenFromCookies(request);
    if (cookieToken) {
      return cookieToken;
    }

    return undefined;
  }

  /**
   * 从 Authorization 头中提取 Bearer Token
   */
  private extractTokenFromBearer(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7); // 移除 "Bearer " 前缀
    }
    return undefined;
  }

  /**
   * 从 Cookie 中提取 token
   */
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
