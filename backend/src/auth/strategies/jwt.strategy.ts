import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
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
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
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
