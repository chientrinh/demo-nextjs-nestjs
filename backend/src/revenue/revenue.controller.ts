import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RevenueService } from './revenue.service.js';
import { CreateRevenueDto } from './dto/create-revenue.dto.js';
import { UpdateRevenueDto } from './dto/update-revenue.dto.js';
import { QueryRevenueDto } from './dto/query-revenue.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Revenue')
@ApiBearerAuth()
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy danh sách doanh thu theo khoảng ngày' })
  @ApiResponse({ status: 200, description: 'Danh sách doanh thu kèm phân trang' })
  async findMany(@Query() query: QueryRevenueDto) {
    return this.revenueService.findMany(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy chi tiết bản ghi doanh thu theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết bản ghi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id') id: string) {
    return this.revenueService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Tạo bản ghi doanh thu mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Trùng ngày và nguồn doanh thu' })
  async create(
    @Body() dto: CreateRevenueDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.revenueService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Cập nhật bản ghi doanh thu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Trùng ngày và nguồn doanh thu' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRevenueDto,
  ) {
    return this.revenueService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Xóa bản ghi doanh thu' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(@Param('id') id: string) {
    await this.revenueService.delete(id);
  }
}
