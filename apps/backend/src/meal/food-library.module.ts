import { Module } from '@nestjs/common';
import { FoodLibraryService } from './food-library.service'; 
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [FoodLibraryService, PrismaService],
  exports: [FoodLibraryService], 
})
export class FoodLibraryModule {}