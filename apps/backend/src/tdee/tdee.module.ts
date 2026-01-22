import { Module } from '@nestjs/common';
import { TdeeController } from './tdee.controller';
import { TdeeService } from './tdee.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [TdeeController],
  providers: [TdeeService, PrismaService],
  exports: [TdeeService],
})
export class TdeeModule {}
