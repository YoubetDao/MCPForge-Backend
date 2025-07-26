import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from '../user/entities/user.entity';

export interface SessionPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * 创建会话Cookie
   */
  async createSession(user: User, response: Response): Promise<void> {
    const payload: SessionPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    // 生成JWT token用于Cookie
    const token = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7天过期
    });

    // 设置HTTP-only Cookie
    const isProduction = process.env.NODE_ENV === 'production';
    // 检查是否使用 HTTPS（通过检查是否有 SSL 证书或者 URL 协议）
    const isHttps = process.env.HTTPS === 'true' || process.env.SSL_ENABLED === 'true';

    response.cookie('auth-session', token, {
      httpOnly: true,
      secure: isProduction && isHttps, // 只有在生产环境且使用 HTTPS 时才启用 secure
      sameSite: 'lax', // 统一使用 lax
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
      // 开发环境不设置domain，让浏览器自动处理
    });
  }

  /**
   * 验证会话Cookie
   */
  async validateSession(token: string): Promise<SessionPayload | null> {
    try {
      const payload = this.jwtService.verify<SessionPayload>(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 清除会话Cookie
   */
  clearSession(response: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = process.env.HTTPS === 'true' || process.env.SSL_ENABLED === 'true';

    response.clearCookie('auth-session', {
      httpOnly: true,
      secure: isProduction && isHttps,
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * 生成Bearer Token（用于API测试）
   */
  async generateBearerToken(user: User): Promise<string> {
    const payload: SessionPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    // 生成JWT token，与Cookie中的token格式相同
    return this.jwtService.sign(payload, {
      expiresIn: '7d', // 7天过期
    });
  }

  /**
   * 从Cookie字符串中解析特定Cookie
   */
  parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });

    return cookies;
  }
}
