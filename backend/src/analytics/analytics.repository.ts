import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevenueEntry, LabourCost, EventAnnotation } from '@prisma/client';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRevenueBetween(startDate: Date, endDate: Date): Promise<RevenueEntry[]> {
    return this.prisma.revenueEntry.findMany({
      where: {
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { entryDate: 'asc' },
    });
  }

  async findLabourBetween(startDate: Date, endDate: Date): Promise<LabourCost[]> {
    return this.prisma.labourCost.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { expenseDate: 'asc' },
    });
  }

  async findEventsBetween(startDate: Date, endDate: Date): Promise<EventAnnotation[]> {
    return this.prisma.eventAnnotation.findMany({
      where: {
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }
}
