import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Department, PaymentMethod } from '@prisma/client';

export class UpdateLabourDto {
  @ApiPropertyOptional({ example: '2026-10-12', description: 'Ngày chi phí YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: 'expenseDate phải có định dạng YYYY-MM-DD' })
  expenseDate?: string;

  @ApiPropertyOptional({ example: 1800000, description: 'Chi phí nhân công VND (> 0)' })
  @IsOptional()
  @IsInt({ message: 'amount phải là số nguyên' })
  @Min(1, { message: 'amount phải lớn hơn 0' })
  amount?: number;

  @ApiPropertyOptional({ enum: Department, example: Department.FOH, description: 'Bộ phận' })
  @IsOptional()
  @IsEnum(Department, { message: 'department không hợp lệ' })
  department?: Department;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.CASH_TILL,
    description: 'Phương thức thanh toán',
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod không hợp lệ' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Ca tối 4 người', description: 'Ghi chú (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note không được vượt quá 500 ký tự' })
  note?: string;
}
