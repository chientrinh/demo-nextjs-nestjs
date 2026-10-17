import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department, PaymentMethod } from '@prisma/client';

export class CreateLabourDto {
  @ApiProperty({ example: '2026-10-12', description: 'Ngày chi phí YYYY-MM-DD' })
  @IsDateString({}, { message: 'expenseDate phải có định dạng YYYY-MM-DD' })
  expenseDate!: string;

  @ApiProperty({ example: 1800000, description: 'Chi phí nhân công USD (> 0)' })
  @IsInt({ message: 'amount phải là số nguyên' })
  @Min(1, { message: 'amount phải lớn hơn 0' })
  amount!: number;

  @ApiProperty({ enum: Department, example: Department.FOH, description: 'Bộ phận' })
  @IsEnum(Department, { message: 'department không hợp lệ' })
  department!: Department;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH_TILL,
    description: 'Phương thức thanh toán',
  })
  @IsEnum(PaymentMethod, { message: 'paymentMethod không hợp lệ' })
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ example: 'Ca tối 4 người', description: 'Ghi chú (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'note không được vượt quá 500 ký tự' })
  note?: string;
}
