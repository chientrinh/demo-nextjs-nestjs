import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevenueSource, WorkShift } from '@prisma/client';

export class QueryEventDto {
  @ApiProperty({ example: '2026-10-01', description: 'Từ ngày YYYY-MM-DD' })
  @IsDateString({}, { message: 'from phải có định dạng YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ example: '2026-10-31', description: 'Đến ngày YYYY-MM-DD' })
  @IsDateString({}, { message: 'to phải có định dạng YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ enum: RevenueSource, description: 'Lọc theo nguồn doanh thu ảnh hưởng' })
  @IsOptional()
  @IsEnum(RevenueSource, { message: 'source không hợp lệ' })
  source?: RevenueSource;

  @ApiPropertyOptional({ enum: WorkShift, description: 'Lọc theo ca làm việc' })
  @IsOptional()
  @IsEnum(WorkShift, { message: 'shift không hợp lệ' })
  shift?: WorkShift;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Số bản ghi mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
