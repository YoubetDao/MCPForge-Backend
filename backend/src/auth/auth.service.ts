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
    response.cookie('auth-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
    } catch (error) {
      return null;
    }
  }

  /**
   * 清除会话Cookie
   */
  clearSession(response: Response): void {
    response.clearCookie('auth-session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
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
