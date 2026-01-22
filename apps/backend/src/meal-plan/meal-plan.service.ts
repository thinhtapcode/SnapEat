import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealPlanDto) {
    return this.prisma.mealPlan.create({
      data: {
        userId,
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        dailyCalories: dto.dailyCalories,
        dailyMacros: dto.dailyMacros,
        meals: dto.meals || [],
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    return mealPlan;
  }

  async findActive(userId: string) {
    const now = new Date();
    return this.prisma.mealPlan.findMany({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateMealPlanDto) {
    await this.findOne(id, userId);

    return this.prisma.mealPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }
}
