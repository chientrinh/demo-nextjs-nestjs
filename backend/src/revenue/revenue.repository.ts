import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, RevenueEntry, RevenueSource } from '@prisma/client';

@Injectable()
export class RevenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(entryDate: Date, source: RevenueSource): Promise<RevenueEntry | null> {
    return this.prisma.revenueEntry.findUnique({
      where: {
        entryDate_source: {
          entryDate,
          source,
        },
      },
    });
  }

  async findById(id: string): Promise<RevenueEntry | null> {
    return this.prisma.revenueEntry.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RevenueEntryWhereInput;
    orderBy?: Prisma.RevenueEntryOrderByWithRelationInput;
  }): Promise<RevenueEntry[]> {
    return this.prisma.revenueEntry.findMany({
      ...params,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async count(where?: Prisma.RevenueEntryWhereInput): Promise<number> {
    return this.prisma.revenueEntry.count({ where });
  }

  async create(data: Prisma.RevenueEntryCreateInput): Promise<RevenueEntry> {
    return this.prisma.revenueEntry.create({
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.RevenueEntryUpdateInput): Promise<RevenueEntry> {
    return this.prisma.revenueEntry.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async delete(id: string): Promise<RevenueEntry> {
    return this.prisma.revenueEntry.delete({
      where: { id },
    });
  }
}
