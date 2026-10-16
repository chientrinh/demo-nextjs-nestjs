import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RevenueSource } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRevenueDto {
  @ApiPropertyOptional({ example: '2026-10-12', description: 'Từ ngày (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-18', description: 'Đến ngày (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ enum: RevenueSource })
  @IsEnum(RevenueSource)
  @IsOptional()
  source?: RevenueSource;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;
}
