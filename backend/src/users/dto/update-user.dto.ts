import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(120, { message: 'Họ tên không được vượt quá 120 ký tự' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'MatKhauMoi@123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(12, { message: 'Mật khẩu phải có ít nhất 12 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
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
