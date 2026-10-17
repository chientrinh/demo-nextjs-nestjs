import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = { getAllAndOverride: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get(RolesGuard);
    vi.clearAllMocks();
  });

  function contextWithUser(user: unknown): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  it('cho phép khi endpoint không yêu cầu role', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextWithUser({ role: 'ANALYST' }))).toBe(true);
  });

  it('cho phép khi role nằm trong danh sách cho phép', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER']);
    expect(guard.canActivate(contextWithUser({ role: 'ADMIN' }))).toBe(true);
  });

  it('từ chối khi người dùng không có role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(contextWithUser({}))).toThrow(ForbiddenException);
  });

  it('từ chối khi role không nằm trong danh sách', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER']);
    expect(() => guard.canActivate(contextWithUser({ role: 'ANALYST' }))).toThrow(ForbiddenException);
  });
});
