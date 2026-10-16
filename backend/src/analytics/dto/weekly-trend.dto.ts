import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyTrendDto {
  @ApiProperty({
    example: '2026-10-12',
    description: 'Ngày bắt đầu tuần (bắt buộc phải là thứ Hai) YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'weekStart không được để trống' })
  @IsDateString({}, { message: 'weekStart phải có định dạng YYYY-MM-DD' })
  weekStart!: string;
}
