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
import { LabourService } from './labour.service.js';
import { CreateLabourDto } from './dto/create-labour.dto.js';
import { UpdateLabourDto } from './dto/update-labour.dto.js';
import { QueryLabourDto } from './dto/query-labour.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Labour')
@ApiBearerAuth()
@Controller('labour')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy danh sách chi phí nhân công theo khoảng ngày' })
  @ApiResponse({ status: 200, description: 'Danh sách chi phí nhân công kèm phân trang' })
  async findMany(@Query() query: QueryLabourDto) {
    return this.labourService.findMany(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy chi tiết chi phí nhân công theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết bản ghi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id') id: string) {
    return this.labourService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Tạo bản ghi chi phí nhân công mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ (amount <= 0)' })
  async create(
    @Body() dto: CreateLabourDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.labourService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Cập nhật chi phí nhân công' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLabourDto,
  ) {
    return this.labourService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Xóa chi phí nhân công' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(@Param('id') id: string) {
    await this.labourService.delete(id);
  }
}
