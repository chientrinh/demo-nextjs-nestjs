import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'MatKhauMoi@123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role, { message: 'Vai trò người dùng không hợp lệ' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  @IsOptional()
  isActive?: boolean;
}
