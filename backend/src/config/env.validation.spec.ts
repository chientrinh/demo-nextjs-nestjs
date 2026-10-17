import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './env.validation.js';

const validEnvironment = {
  DATABASE_URL: 'postgresql://bistro:password@localhost:5432/bistro?schema=public',
  JWT_SECRET: 'access-secret-that-is-at-least-thirty-two-characters',
  JWT_REFRESH_SECRET: 'refresh-secret-that-is-at-least-thirty-two-characters',
  CORS_ORIGIN: 'http://localhost:3000',
};

describe('validateEnvironment', () => {
  it('applies development defaults', () => {
    const config = validateEnvironment(validEnvironment);

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3001);
  });

  it('rejects identical JWT secrets', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        JWT_REFRESH_SECRET: validEnvironment.JWT_SECRET,
      }),
    ).toThrow('JWT_SECRET và JWT_REFRESH_SECRET phải khác nhau');
  });

  it('rejects missing required configuration', () => {
    const { CORS_ORIGIN: _corsOrigin, ...environmentWithoutCors } = validEnvironment;

    expect(() => validateEnvironment(environmentWithoutCors)).toThrow('CORS_ORIGIN');
  });
});
