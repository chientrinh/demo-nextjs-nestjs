import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventAnnotation, Prisma } from '@prisma/client';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EventAnnotationCreateInput): Promise<EventAnnotation> {
    return this.prisma.eventAnnotation.create({
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findById(id: string): Promise<EventAnnotation | null> {
    return this.prisma.eventAnnotation.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.EventAnnotationWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.EventAnnotationOrderByWithRelationInput;
  }): Promise<EventAnnotation[]> {
    return this.prisma.eventAnnotation.findMany({
      ...params,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async count(where?: Prisma.EventAnnotationWhereInput): Promise<number> {
    return this.prisma.eventAnnotation.count({ where });
  }

  async update(id: string, data: Prisma.EventAnnotationUpdateInput): Promise<EventAnnotation> {
    return this.prisma.eventAnnotation.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async delete(id: string): Promise<EventAnnotation> {
    return this.prisma.eventAnnotation.delete({
      where: { id },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EventAnnotation[]> {
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
