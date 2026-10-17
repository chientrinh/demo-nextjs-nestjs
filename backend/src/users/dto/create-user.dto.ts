import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@bistro.local' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({ example: 'MatKhau@123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(12, { message: 'Mật khẩu phải có ít nhất 12 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(120, { message: 'Họ tên không được vượt quá 120 ký tự' })
  fullName!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.ANALYST })
  @IsEnum(Role, { message: 'Vai trò người dùng không hợp lệ' })
  @IsOptional()
  role?: Role;
}
