import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export type SanitizedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  sanitize(user: User): SanitizedUser {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }

  async findById(id: string): Promise<SanitizedUser> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.notFound,
        message: 'Không tìm thấy người dùng',
      });
    }
    return this.sanitize(user);
  }

  async findRawByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  async findRawById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }

  async findAll(): Promise<SanitizedUser[]> {
    const users = await this.usersRepo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.sanitize(u));
  }

  async create(dto: CreateUserDto): Promise<SanitizedUser> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.duplicateEmail,
        message: 'Email này đã được sử dụng',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      role: dto.role,
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SanitizedUser> {
    await this.findById(id);

    const updateData: any = {};
    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.role) updateData.role = dto.role;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      updateData.tokenVersion = { increment: 1 };
    }

    const updated = await this.usersRepo.update(id, updateData);
    return this.sanitize(updated);
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.usersRepo.incrementTokenVersion(id);
  }
}
