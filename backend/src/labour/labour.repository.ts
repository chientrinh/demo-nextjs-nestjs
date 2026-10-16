import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LabourCost, Prisma } from '@prisma/client';

@Injectable()
export class LabourRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LabourCostCreateInput): Promise<LabourCost> {
    return this.prisma.labourCost.create({
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findById(id: string): Promise<LabourCost | null> {
    return this.prisma.labourCost.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.LabourCostWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.LabourCostOrderByWithRelationInput;
  }): Promise<LabourCost[]> {
    return this.prisma.labourCost.findMany({
      ...params,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async count(where?: Prisma.LabourCostWhereInput): Promise<number> {
    return this.prisma.labourCost.count({ where });
  }

  async update(id: string, data: Prisma.LabourCostUpdateInput): Promise<LabourCost> {
    return this.prisma.labourCost.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async delete(id: string): Promise<LabourCost> {
    return this.prisma.labourCost.delete({
      where: { id },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<LabourCost[]> {
    return this.prisma.labourCost.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}
