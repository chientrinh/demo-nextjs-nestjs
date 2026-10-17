import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';
import { UpdateUserDto } from './update-user.dto.js';

const strongPassword = 'BistroAnalytics@2026';

describe('User DTO validation', () => {
  it('rejects a weak password when creating a user', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      email: 'user@bistro.local',
      fullName: 'Nguyễn Văn A',
      password: 'weakpass',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('accepts a strong password when updating a user', async () => {
    const dto = Object.assign(new UpdateUserDto(), { password: strongPassword });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a full name longer than 120 characters', async () => {
    const dto = Object.assign(new UpdateUserDto(), { fullName: 'a'.repeat(121) });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'fullName')).toBe(true);
  });
});
