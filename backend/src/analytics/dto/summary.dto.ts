import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SummaryDto {
  @ApiProperty({ example: '2026-10-01', description: 'Từ ngày YYYY-MM-DD' })
  @IsNotEmpty({ message: 'from không được để trống' })
  @IsDateString({}, { message: 'from phải có định dạng YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ example: '2026-10-31', description: 'Đến ngày YYYY-MM-DD' })
  @IsNotEmpty({ message: 'to không được để trống' })
  @IsDateString({}, { message: 'to phải có định dạng YYYY-MM-DD' })
  to!: string;
}
