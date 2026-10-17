import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

vi.mock('bcryptjs');

const user = {
  id: 'u1',
  email: 'admin@bistro.local',
  passwordHash: 'hashed',
  fullName: 'Quản trị viên',
  role: 'ADMIN',
  isActive: true,
  tokenVersion: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findRawByEmail: vi.fn(),
    findRawById: vi.fn(),
    sanitize: vi.fn(),
    incrementTokenVersion: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn(), verify: vi.fn() };
  const configService = { getOrThrow: vi.fn() };

  beforeEach(async () => {
    configService.getOrThrow.mockImplementation((key: string) =>
      key === 'JWT_SECRET' ? 'access-secret' : 'refresh-secret',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('từ chối khi email không tồn tại', async () => {
      usersService.findRawByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'x@y.z', password: '123456' })).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('từ chối khi tài khoản bị vô hiệu hóa', async () => {
      usersService.findRawByEmail.mockResolvedValue({ ...user, isActive: false });
      await expect(service.login({ email: 'x@y.z', password: '123456' })).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('từ chối khi sai mật khẩu', async () => {
      usersService.findRawByEmail.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);
      await expect(service.login({ email: 'x@y.z', password: 'sai' })).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('trả accessToken, refreshToken và user đã loại bỏ passwordHash', async () => {
      usersService.findRawByEmail.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');
      usersService.sanitize.mockReturnValue({ id: 'u1', email: 'admin@bistro.local' });

      const result = await service.login({ email: 'admin@bistro.local', password: '123456' });

      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
      expect(usersService.sanitize).toHaveBeenCalledWith(user);
      expect(result.user).toEqual({ id: 'u1', email: 'admin@bistro.local' });
    });
  });

  describe('refresh', () => {
    it('từ chối khi thiếu refresh token', async () => {
      await expect(service.refresh('')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('từ chối khi tokenVersion không khớp', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', tokenVersion: 0 });
      usersService.findRawById.mockResolvedValue({ ...user, tokenVersion: 5 });
      await expect(service.refresh('token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('xoay vòng token và trả user', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', tokenVersion: 0 });
      usersService.findRawById.mockResolvedValue(user);
      usersService.incrementTokenVersion.mockResolvedValue({ ...user, tokenVersion: 1 });
      jwtService.signAsync.mockResolvedValue('new-token');
      usersService.sanitize.mockReturnValue({ id: 'u1', email: 'admin@bistro.local' });

      const result = await service.refresh('token');

      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith('u1');
      expect(result.accessToken).toBe('new-token');
      expect(result.user).toEqual({ id: 'u1', email: 'admin@bistro.local' });
    });
  });

  describe('logout', () => {
    it('tăng tokenVersion và trả success', async () => {
      usersService.incrementTokenVersion.mockResolvedValue(user);
      const result = await service.logout('u1');
      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ success: true });
    });
  });
});
