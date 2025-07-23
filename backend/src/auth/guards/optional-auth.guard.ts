import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, SessionPayload } from '../auth.service';

/**
 * 可选认证守卫 - 如果有有效的认证信息则解析用户，但不强制要求认证
 * 适用于那些登录用户和匿名用户都可以访问，但需要区分用户身份的端点
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 尝试从多种方式获取token：Bearer Token 优先，然后是 Cookie
    const token = this.extractTokenFromRequest(request);

    if (token) {
      try {
        // 验证token并获取用户信息
        const payload = await this.authService.validateSession(token);

        if (payload) {
          // 将用户信息附加到请求对象
          request.user = payload;
        }
      } catch (error) {
        // 忽略认证错误，继续处理请求
        console.warn('Optional auth failed:', error.message);
      }
    }

    // 总是允许请求通过
    return true;
  }

  /**
   * 从请求中提取token，支持多种方式
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
      return authorization.substring(7);
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
