import { Module } from '@nestjs/common';
import { TdeeController } from './tdee.controller';
import { TdeeService } from './tdee.service';
import { PrismaService } from '../common/prisma.service';
import { TdeeListener } from './tdee.listener';

@Module({
  controllers: [TdeeController],
  providers: [TdeeService, TdeeListener, PrismaService], // Thêm TdeeListener vào đây
  exports: [TdeeService],
})
export class TdeeModule {}
