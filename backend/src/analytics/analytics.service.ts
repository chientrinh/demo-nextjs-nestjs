import { Injectable, BadRequestException } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  async getWeeklyTrend(weekStartStr: string) {
    const startDate = new Date(`${weekStartStr}T00:00:00.000Z`);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException({
        code: ERROR_CODES.validationError,
        message: 'weekStart không đúng định dạng YYYY-MM-DD.',
      });
    }

    // getUTCDay: 0 là Chủ Nhật, 1 là Thứ Hai
    if (startDate.getUTCDay() !== 1) {
      throw new BadRequestException({
        code: ERROR_CODES.validationError,
        message: 'weekStart phải là ngày thứ Hai (Monday).',
      });
    }

    // Sinh 7 ngày trong tuần
    const dateStrList: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dateStrList.push(d.toISOString().split('T')[0]);
    }

    const endDate = new Date(`${dateStrList[6]}T23:59:59.999Z`);

    const [revenues, labours, events] = await Promise.all([
      this.analyticsRepo.findRevenueBetween(startDate, endDate),
      this.analyticsRepo.findLabourBetween(startDate, endDate),
      this.analyticsRepo.findEventsBetween(startDate, endDate),
    ]);

    const days = dateStrList.map((dateStr) => {
      let posRevenue = 0;
      let eatclubRevenue = 0;

      for (const r of revenues) {
        const rDate = r.entryDate instanceof Date
          ? r.entryDate.toISOString().split('T')[0]
          : String(r.entryDate).split('T')[0];

        if (rDate === dateStr) {
          if (r.source === 'POS') posRevenue += Number(r.amount);
          if (r.source === 'EATCLUB') eatclubRevenue += Number(r.amount);
        }
      }

      let labourCost = 0;
      for (const l of labours) {
        const lDate = l.expenseDate instanceof Date
          ? l.expenseDate.toISOString().split('T')[0]
          : String(l.expenseDate).split('T')[0];

        if (lDate === dateStr) {
          labourCost += Number(l.amount);
        }
      }

      return {
        date: dateStr,
        posRevenue,
        eatclubRevenue,
        labourCost,
      };
    });

    const mappedEvents = events.map((e) => {
      const eDate = e.eventDate instanceof Date
        ? e.eventDate.toISOString().split('T')[0]
        : String(e.eventDate).split('T')[0];

      return {
        id: e.id,
        title: e.title,
        source: e.source,
        amount: Number(e.amount),
        eventDate: eDate,
        shift: e.shift,
        note: e.note,
      };
    });

    return {
      weekStart: weekStartStr,
      days,
      events: mappedEvents,
    };
  }

  async getSummary(fromStr: string, toStr: string) {
    const startDate = new Date(`${fromStr}T00:00:00.000Z`);
    const endDate = new Date(`${toStr}T23:59:59.999Z`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException({
        code: ERROR_CODES.validationError,
        message: 'from và to phải có định dạng YYYY-MM-DD.',
      });
    }

    if (startDate > endDate) {
      throw new BadRequestException({
        code: ERROR_CODES.validationError,
        message: 'to phải lớn hơn hoặc bằng from.',
      });
    }

    const revenues = await this.analyticsRepo.findRevenueBetween(startDate, endDate);

    let totalRevenue = 0;
    let totalCovers = 0;
    const datesWithData = new Set<string>();

    for (const r of revenues) {
      totalRevenue += Number(r.amount);
      totalCovers += r.covers;
      const rDate = r.entryDate instanceof Date
        ? r.entryDate.toISOString().split('T')[0]
        : String(r.entryDate).split('T')[0];
      datesWithData.add(rDate);
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const fromUtc = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const toUtc = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
    const calendarDays = Math.round((toUtc - fromUtc) / msPerDay) + 1;

    const averagePerDay = calendarDays > 0 ? Math.round(totalRevenue / calendarDays) : 0;

    return {
      totalRevenue,
      averagePerDay,
      totalCovers,
      daysWithData: datesWithData.size,
    };
  }
}
