import { Module } from '@nestjs/common';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { PrismaService } from '../common/prisma.service';
import { FoodLibraryService } from './food-library.service';


@Module({
  controllers: [MealController],
  providers: [MealService, FoodLibraryService, PrismaService], // Thêm vào đây
  exports: [FoodLibraryService], // Export nếu muốn dùng ở module khác
})
export class MealModule {}