import { Module } from '@nestjs/common';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MealController],
  providers: [MealService, PrismaService],
  exports: [MealService],
})
export class MealModule {}
