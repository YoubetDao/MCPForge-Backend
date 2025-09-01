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
  createSession(
    user: User,
    response: Response,
    request?: { headers?: { origin?: string; referer?: string } },
  ): void {
    const payload: SessionPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    // 生成JWT token用于Cookie
    const token = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7天过期
    });

    // 检测请求来源，决定cookie安全设置
    const isProduction = process.env.NODE_ENV === 'production';
    const origin = request?.headers?.origin || '';
    const referer = request?.headers?.referer || '';

    // 如果请求来自localhost或127.0.0.1，即使在生产环境也不使用secure
    const isFromLocalhost =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      referer.includes('localhost') ||
      referer.includes('127.0.0.1');

    // const shouldBeSecure = isProduction && !isFromLocalhost;
    // const shouldBeSecure = false

    console.log(
      `🍪 Setting cookie - Production: ${isProduction}, Origin: ${origin}, Secure: ${false}`,
    );

    response.cookie('auth-session', token, {
      httpOnly: false,
      secure: false, // 智能决定是否使用secure
      sameSite: "none", // 跨域时用none，本地用lax
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
    });
  }

  /**
   * 验证会话Cookie
   */
  async validateSession(token: string): Promise<SessionPayload | null> {
    try {
      const payload = this.jwtService.verify<SessionPayload>(token);
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * 清除会话Cookie
   */
  clearSession(
    response: Response,
    request?: { headers?: { origin?: string; referer?: string } },
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const origin = request?.headers?.origin || '';
    const referer = request?.headers?.referer || '';

    // 如果请求来自localhost或127.0.0.1，即使在生产环境也不使用secure
    const isFromLocalhost =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      referer.includes('localhost') ||
      referer.includes('127.0.0.1');

    const shouldBeSecure = isProduction && !isFromLocalhost;

    response.clearCookie('auth-session', {
      httpOnly: true,
      secure: shouldBeSecure,
      sameSite: shouldBeSecure ? 'none' : 'lax',
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

    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });

    return cookies;
  }
}
