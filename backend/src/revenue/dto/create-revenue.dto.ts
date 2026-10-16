import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { RevenueSource } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRevenueDto {
  @ApiProperty({ example: '2026-10-16', description: 'Ngày phát sinh doanh thu (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Ngày phải có định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Ngày không được để trống' })
  entryDate!: string;

  @ApiProperty({ enum: RevenueSource, example: RevenueSource.POS, description: 'Nguồn doanh thu: POS hoặc EATCLUB' })
  @IsEnum(RevenueSource, { message: 'Nguồn doanh thu không hợp lệ (chỉ POS hoặc EATCLUB)' })
  @IsNotEmpty({ message: 'Nguồn doanh thu không được để trống' })
  source!: RevenueSource;

  @ApiProperty({ example: 15000000, description: 'Số tiền doanh thu (VND, số nguyên ≥ 0)' })
  @IsInt({ message: 'Số tiền phải là số nguyên' })
  @Min(0, { message: 'Số tiền doanh thu không được âm' })
  amount!: number;

  @ApiPropertyOptional({ example: 120, description: 'Số lượng lượt khách (covers)' })
  @IsInt({ message: 'Số lượt khách phải là số nguyên' })
  @Min(0, { message: 'Số lượt khách không được âm' })
  @IsOptional()
  covers?: number;

  @ApiPropertyOptional({ example: 'Doanh thu ngày thứ Sáu đông khách' })
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  @IsOptional()
  note?: string;
}
