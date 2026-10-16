import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from './events.repository.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { QueryEventDto } from './dto/query-event.dto.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';

export interface FormattedEvent {
  id: string;
  title: string;
  source: string;
  amount: number;
  eventDate: string;
  shift: string;
  note: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; fullName: string; email: string };
}

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepo: EventsRepository) {}

  format(entry: any): FormattedEvent {
    const dateStr = entry.eventDate instanceof Date
      ? entry.eventDate.toISOString().split('T')[0]
      : String(entry.eventDate);

    return {
      id: entry.id,
      title: entry.title,
      source: entry.source,
      amount: Number(entry.amount),
      eventDate: dateStr,
      shift: entry.shift,
      note: entry.note,
      createdById: entry.createdById,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
      updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt,
      createdBy: entry.createdBy,
    };
  }

  async create(dto: CreateEventDto, userId: string): Promise<FormattedEvent> {
    const eventDate = new Date(dto.eventDate);

    const created = await this.eventsRepo.create({
      title: dto.title,
      source: dto.source,
      amount: dto.amount,
      eventDate,
      shift: dto.shift,
      note: dto.note,
      createdBy: { connect: { id: userId } },
    });

    return this.format(created);
  }

  async findMany(query: QueryEventDto) {
    const where: any = {};

    if (query.from || query.to) {
      where.eventDate = {};
      if (query.from) where.eventDate.gte = new Date(query.from);
      if (query.to) where.eventDate.lte = new Date(query.to);
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.shift) {
      where.shift = query.shift;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      this.eventsRepo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { eventDate: 'desc' },
      }),
      this.eventsRepo.count(where),
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

  async findById(id: string): Promise<FormattedEvent> {
    const entry = await this.eventsRepo.findById(id);
    if (!entry) {
      throw new NotFoundException({
        code: ERROR_CODES.notFound,
        message: 'Không tìm thấy sự kiện',
      });
    }
    return this.format(entry);
  }

  async update(id: string, dto: UpdateEventDto): Promise<FormattedEvent> {
    await this.findById(id);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.source) data.source = dto.source;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.eventDate) data.eventDate = new Date(dto.eventDate);
    if (dto.shift) data.shift = dto.shift;
    if (dto.note !== undefined) data.note = dto.note;

    const updated = await this.eventsRepo.update(id, data);
    return this.format(updated);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.eventsRepo.delete(id);
  }
}
