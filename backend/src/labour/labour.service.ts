import { Injectable, NotFoundException } from '@nestjs/common';
import { LabourRepository } from './labour.repository.js';
import { CreateLabourDto } from './dto/create-labour.dto.js';
import { UpdateLabourDto } from './dto/update-labour.dto.js';
import { QueryLabourDto } from './dto/query-labour.dto.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';

export interface FormattedLabour {
  id: string;
  expenseDate: string;
  amount: number;
  department: string;
  paymentMethod: string;
  note: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; fullName: string; email: string };
}

@Injectable()
export class LabourService {
  constructor(private readonly labourRepo: LabourRepository) {}

  format(entry: any): FormattedLabour {
    const dateStr = entry.expenseDate instanceof Date
      ? entry.expenseDate.toISOString().split('T')[0]
      : String(entry.expenseDate);

    return {
      id: entry.id,
      expenseDate: dateStr,
      amount: Number(entry.amount),
      department: entry.department,
      paymentMethod: entry.paymentMethod,
      note: entry.note,
      createdById: entry.createdById,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
      updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt,
      createdBy: entry.createdBy,
    };
  }

  async create(dto: CreateLabourDto, userId: string): Promise<FormattedLabour> {
    const expenseDate = new Date(dto.expenseDate);

    const created = await this.labourRepo.create({
      expenseDate,
      amount: dto.amount,
      department: dto.department,
      paymentMethod: dto.paymentMethod,
      note: dto.note,
      createdBy: { connect: { id: userId } },
    });

    return this.format(created);
  }

  async findMany(query: QueryLabourDto) {
    const where: any = {};

    if (query.from || query.to) {
      where.expenseDate = {};
      if (query.from) where.expenseDate.gte = new Date(query.from);
      if (query.to) where.expenseDate.lte = new Date(query.to);
    }

    if (query.department) {
      where.department = query.department;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      this.labourRepo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { expenseDate: 'desc' },
      }),
      this.labourRepo.count(where),
    ]);

    return {
      data: entries.map((e) => this.format(e)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(id: string): Promise<FormattedLabour> {
    const entry = await this.labourRepo.findById(id);
    if (!entry) {
      throw new NotFoundException({
        code: ERROR_CODES.notFound,
        message: 'Không tìm thấy bản ghi chi phí nhân công',
      });
    }
    return this.format(entry);
  }

  async update(id: string, dto: UpdateLabourDto): Promise<FormattedLabour> {
    await this.findById(id);

    const data: any = {};
    if (dto.expenseDate) data.expenseDate = new Date(dto.expenseDate);
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.department) data.department = dto.department;
    if (dto.paymentMethod) data.paymentMethod = dto.paymentMethod;
    if (dto.note !== undefined) data.note = dto.note;

    const updated = await this.labourRepo.update(id, data);
    return this.format(updated);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.labourRepo.delete(id);
  }
}
