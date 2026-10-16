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
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { QueryEventDto } from './dto/query-event.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy danh sách sự kiện theo khoảng ngày' })
  @ApiResponse({ status: 200, description: 'Danh sách sự kiện kèm phân trang' })
  async findMany(@Query() query: QueryEventDto) {
    return this.eventsService.findMany(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANALYST)
  @ApiOperation({ summary: 'Lấy chi tiết sự kiện theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết bản ghi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Tạo sự kiện mới ghim lên biểu đồ' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ (title > 80 ký tự)' })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Cập nhật sự kiện' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Xóa sự kiện' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(@Param('id') id: string) {
    await this.eventsService.delete(id);
  }
}
