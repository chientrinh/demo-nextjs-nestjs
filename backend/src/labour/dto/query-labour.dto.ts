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
import { Department, PaymentMethod } from '@prisma/client';

export class QueryLabourDto {
  @ApiProperty({ example: '2026-10-01', description: 'Từ ngày YYYY-MM-DD' })
  @IsDateString({}, { message: 'from phải có định dạng YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ example: '2026-10-31', description: 'Đến ngày YYYY-MM-DD' })
  @IsDateString({}, { message: 'to phải có định dạng YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ enum: Department, description: 'Lọc theo bộ phận' })
  @IsOptional()
  @IsEnum(Department, { message: 'department không hợp lệ' })
  department?: Department;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Lọc theo phương thức thanh toán' })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod không hợp lệ' })
  paymentMethod?: PaymentMethod;

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
