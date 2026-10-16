import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { RevenueSource } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRevenueDto {
  @ApiPropertyOptional({ example: '2026-10-16' })
  @IsDateString({}, { message: 'Ngày phải có định dạng YYYY-MM-DD' })
  @IsOptional()
  entryDate?: string;

  @ApiPropertyOptional({ enum: RevenueSource })
  @IsEnum(RevenueSource, { message: 'Nguồn doanh thu không hợp lệ' })
  @IsOptional()
  source?: RevenueSource;

  @ApiPropertyOptional({ example: 18000000 })
  @IsInt({ message: 'Số tiền phải là số nguyên' })
  @Min(0, { message: 'Số tiền doanh thu không được âm' })
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 140 })
  @IsInt({ message: 'Số lượt khách phải là số nguyên' })
  @Min(0, { message: 'Số lượt khách không được âm' })
  @IsOptional()
  covers?: number;

  @ApiPropertyOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  @IsOptional()
  note?: string;
}
