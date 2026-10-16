import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecret = process.env.JWT_SECRET || '';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
  }

  onModuleInit() {
    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment.');
    }
    if (this.jwtSecret === this.jwtRefreshSecret) {
      throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be different.');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findRawByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.invalidCredentials,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: ERROR_CODES.accountInactive,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa',
      });
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: ERROR_CODES.invalidCredentials,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const tokens = await this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.usersService.sanitize(user),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: ERROR_CODES.invalidRefreshToken,
        message: 'Thiếu refresh token',
      });
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      const user = await this.usersService.findRawById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException({
          code: ERROR_CODES.accountInactive,
          message: 'Tài khoản không tồn tại hoặc đã bị khóa',
        });
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException({
          code: ERROR_CODES.invalidRefreshToken,
          message: 'Refresh token đã hết hạn hoặc bị thu hồi',
        });
      }

      const tokens = await this.generateTokens(user);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.usersService.sanitize(user),
      };
    } catch {
      throw new UnauthorizedException({
        code: ERROR_CODES.invalidRefreshToken,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      });
    }
  }

  async logout(userId: string) {
    await this.usersService.incrementTokenVersion(userId);
    return { success: true };
  }

  private async generateTokens(user: { id: string; email: string; role: string; tokenVersion: number }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshPayload = {
      ...payload,
      tokenVersion: user.tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
