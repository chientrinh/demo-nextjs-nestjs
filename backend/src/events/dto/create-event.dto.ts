import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevenueSource, WorkShift } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Live nhạc tối thứ Bảy', description: 'Tiêu đề sự kiện (1-80 ký tự)' })
  @IsString({ message: 'title phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'title không được để trống' })
  @MaxLength(80, { message: 'title không được vượt quá 80 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  @ApiProperty({ enum: RevenueSource, example: RevenueSource.POS, description: 'Nguồn ảnh hưởng' })
  @IsEnum(RevenueSource, { message: 'source không hợp lệ' })
  source!: RevenueSource;

  @ApiProperty({
    example: 2500000,
    description: 'Ảnh hưởng doanh thu USD (số nguyên, có thể âm)',
  })
  @IsInt({ message: 'amount phải là số nguyên' })
  amount!: number;

  @ApiProperty({ example: '2026-10-17', description: 'Ngày sự kiện YYYY-MM-DD' })
  @IsDateString({}, { message: 'eventDate phải có định dạng YYYY-MM-DD' })
  eventDate!: string;

  @ApiProperty({ enum: WorkShift, example: WorkShift.CA_TOI, description: 'Ca làm việc' })
  @IsEnum(WorkShift, { message: 'shift không hợp lệ' })
  shift!: WorkShift;

  @ApiPropertyOptional({ example: 'Ban nhạc 5 người', description: 'Ghi chú (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note không được vượt quá 500 ký tự' })
  note?: string;
}
