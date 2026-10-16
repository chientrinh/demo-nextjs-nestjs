import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service.js';
import { WeeklyTrendDto } from './dto/weekly-trend.dto.js';
import { SummaryDto } from './dto/summary.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly-trend')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Dữ liệu xu hướng tuần và sự kiện cho biểu đồ Home' })
  @ApiResponse({ status: 200, description: 'Dữ liệu 7 ngày kèm sự kiện' })
  @ApiResponse({ status: 400, description: 'weekStart không hợp lệ hoặc không phải thứ Hai' })
  async getWeeklyTrend(@Query() query: WeeklyTrendDto) {
    return this.analyticsService.getWeeklyTrend(query.weekStart);
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'KPI tổng hợp cho khoảng ngày' })
  @ApiResponse({ status: 200, description: 'Tổng hợp doanh thu, covers, averagePerDay' })
  @ApiResponse({ status: 400, description: 'from/to không hợp lệ' })
  async getSummary(@Query() query: SummaryDto) {
    return this.analyticsService.getSummary(query.from, query.to);
  }
}
