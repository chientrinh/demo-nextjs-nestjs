import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Kiểm tra trạng thái server' })
  @ApiResponse({ status: 200, description: 'Server đang hoạt động bình thường' })
  check(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  @Get('db')
  @Public()
  @ApiOperation({ summary: 'Kiểm tra kết nối cơ sở dữ liệu' })
  @ApiResponse({ status: 200, description: 'Cơ sở dữ liệu đang kết nối bình thường' })
  @ApiResponse({ status: 503, description: 'Không thể kết nối cơ sở dữ liệu' })
  async checkDb(@Res() res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return res.status(HttpStatus.OK).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
