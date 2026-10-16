import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RevenueRepository } from './revenue.repository.js';
import { CreateRevenueDto } from './dto/create-revenue.dto.js';
import { UpdateRevenueDto } from './dto/update-revenue.dto.js';
import { QueryRevenueDto } from './dto/query-revenue.dto.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';

export interface FormattedRevenue {
  id: string;
  entryDate: string;
  source: string;
  amount: number;
  covers: number;
  note: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; fullName: string; email: string };
}

@Injectable()
export class RevenueService {
  constructor(private readonly revenueRepo: RevenueRepository) {}

  format(entry: any): FormattedRevenue {
    const dateStr = entry.entryDate instanceof Date
      ? entry.entryDate.toISOString().split('T')[0]
      : String(entry.entryDate);

    return {
      id: entry.id,
      entryDate: dateStr,
      source: entry.source,
      amount: Number(entry.amount),
      covers: entry.covers,
      note: entry.note,
      createdById: entry.createdById,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
      updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt,
      createdBy: entry.createdBy,
    };
  }

  async create(dto: CreateRevenueDto, userId: string): Promise<FormattedRevenue> {
    const entryDate = new Date(dto.entryDate);

    const existing = await this.revenueRepo.findUnique(entryDate, dto.source);
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.duplicateRevenueEntry,
        message: `Đã tồn tại bản ghi doanh thu cho nguồn ${dto.source} vào ngày ${dto.entryDate}`,
      });
    }

    const created = await this.revenueRepo.create({
      entryDate,
      source: dto.source,
      amount: dto.amount,
      covers: dto.covers ?? 0,
      note: dto.note,
      createdBy: { connect: { id: userId } },
    });

    return this.format(created);
  }

  async findMany(query: QueryRevenueDto) {
    const where: any = {};

    if (query.from || query.to) {
      where.entryDate = {};
      if (query.from) where.entryDate.gte = new Date(query.from);
      if (query.to) where.entryDate.lte = new Date(query.to);
    }

    if (query.source) {
      where.source = query.source;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      this.revenueRepo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { entryDate: 'desc' },
      }),
      this.revenueRepo.count(where),
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

  async findById(id: string): Promise<FormattedRevenue> {
    const entry = await this.revenueRepo.findById(id);
    if (!entry) {
      throw new NotFoundException({
        code: ERROR_CODES.notFound,
        message: 'Không tìm thấy bản ghi doanh thu',
      });
    }
    return this.format(entry);
  }

  async update(id: string, dto: UpdateRevenueDto): Promise<FormattedRevenue> {
    const existing = await this.findById(id);

    const data: any = {};
    if (dto.entryDate) data.entryDate = new Date(dto.entryDate);
    if (dto.source) data.source = dto.source;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.covers !== undefined) data.covers = dto.covers;
    if (dto.note !== undefined) data.note = dto.note;

    if (dto.entryDate || dto.source) {
      const checkDate = dto.entryDate ? new Date(dto.entryDate) : new Date(existing.entryDate);
      const checkSource = (dto.source || existing.source) as any;
      const duplicate = await this.revenueRepo.findUnique(checkDate, checkSource);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException({
          code: ERROR_CODES.duplicateRevenueEntry,
          message: 'Đã tồn tại bản ghi doanh thu cho nguồn này trong ngày đã chọn',
        });
      }
    }

    const updated = await this.revenueRepo.update(id, data);
    return this.format(updated);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.revenueRepo.delete(id);
  }
}
