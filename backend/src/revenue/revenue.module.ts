import { Module } from '@nestjs/common';
import { RevenueController } from './revenue.controller.js';
import { RevenueService } from './revenue.service.js';
import { RevenueRepository } from './revenue.repository.js';

@Module({
  controllers: [RevenueController],
  providers: [RevenueService, RevenueRepository],
  exports: [RevenueService, RevenueRepository],
})
export class RevenueModule {}
