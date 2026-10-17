import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsRepository } from './analytics.repository.js';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const repo = {
    findLabourBetween: vi.fn(),
    findEventsBetween: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: AnalyticsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(AnalyticsService);
    vi.clearAllMocks();
  });

  describe('getWeeklyTrend', () => {
    it('trả về đúng 7 ngày và gộp doanh thu theo nguồn', async () => {
      repo.findLabourBetween.mockResolvedValue([]);
      repo.findEventsBetween.mockResolvedValue([
        { id: 'e1', title: 'A', source: 'POS', amount: 100, eventDate: new Date('2026-10-12T00:00:00.000Z'), shift: 'CA_TOI', note: null },
        { id: 'e2', title: 'B', source: 'EATCLUB', amount: 50, eventDate: new Date('2026-10-12T00:00:00.000Z'), shift: 'CA_TRUA', note: null },
      ]);

      const result = await service.getWeeklyTrend('2026-10-12');

      expect(result.weekStart).toBe('2026-10-12');
      expect(result.days).toHaveLength(7);
      expect(result.days[0]).toMatchObject({ date: '2026-10-12', posRevenue: 100, eatclubRevenue: 50, labourCost: 0 });
      expect(result.events).toHaveLength(2);
    });

    it('điền 0 cho ngày không có dữ liệu', async () => {
      repo.findLabourBetween.mockResolvedValue([]);
      repo.findEventsBetween.mockResolvedValue([]);

      const result = await service.getWeeklyTrend('2026-10-12');

      expect(result.days).toHaveLength(7);
      expect(result.days[1]).toEqual({ date: '2026-10-13', posRevenue: 0, eatclubRevenue: 0, labourCost: 0 });
    });

    it('gộp đúng labourCost theo ngày', async () => {
      repo.findEventsBetween.mockResolvedValue([]);
      repo.findLabourBetween.mockResolvedValue([
        { id: 'l1', expenseDate: new Date('2026-10-12T00:00:00.000Z'), amount: 80, department: 'FOH', paymentMethod: 'CASH_TILL', note: null },
        { id: 'l2', expenseDate: new Date('2026-10-12T00:00:00.000Z'), amount: 20, department: 'BOH', paymentMethod: 'CASH_TILL', note: null },
      ]);

      const result = await service.getWeeklyTrend('2026-10-12');

      expect(result.days[0].labourCost).toBe(100);
    });

    it('từ chối weekStart không phải thứ Hai', async () => {
      await expect(service.getWeeklyTrend('2026-10-13')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('từ chối định dạng ngày không hợp lệ', async () => {
      await expect(service.getWeeklyTrend('khong-phai-ngay')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getSummary', () => {
    it('tính totalRevenue, averagePerDay theo số ngày lịch, covers và ngày có dữ liệu', async () => {
      repo.findEventsBetween.mockResolvedValue([
        { id: 'e1', title: 'A', source: 'POS', amount: 100, eventDate: new Date('2026-10-12T00:00:00.000Z'), shift: 'CA_TOI', note: null },
        { id: 'e2', title: 'B', source: 'EATCLUB', amount: 50, eventDate: new Date('2026-10-12T00:00:00.000Z'), shift: 'CA_TRUA', note: null },
        { id: 'e3', title: 'C', source: 'POS', amount: 30, eventDate: new Date('2026-10-13T00:00:00.000Z'), shift: 'CA_NGAY', note: null },
      ]);

      const result = await service.getSummary('2026-10-12', '2026-10-18');

      expect(result.totalRevenue).toBe(180);
      expect(result.totalCovers).toBe(3);
      expect(result.daysWithData).toBe(2);
      expect(result.averagePerDay).toBe(Math.round(180 / 7));
    });

    it('từ chối khi to nhỏ hơn from', async () => {
      await expect(service.getSummary('2026-10-18', '2026-10-12')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('từ chối định dạng ngày không hợp lệ', async () => {
      await expect(service.getSummary('khong-phai-ngay', '2026-10-18')).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
