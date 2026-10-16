import { Module } from '@nestjs/common';
import { LabourController } from './labour.controller.js';
import { LabourService } from './labour.service.js';
import { LabourRepository } from './labour.repository.js';

@Module({
  controllers: [LabourController],
  providers: [LabourService, LabourRepository],
  exports: [LabourService, LabourRepository],
})
export class LabourModule {}
