import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { ERROR_CODES } from '../../common/constants/error-codes.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findRawById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: !user ? ERROR_CODES.unauthorized : ERROR_CODES.accountInactive,
        message: 'Tài khoản không hợp lệ hoặc đã bị khóa',
      });
    }

    return this.usersService.sanitize(user);
  }
}
