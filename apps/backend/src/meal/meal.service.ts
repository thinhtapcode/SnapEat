import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMealDto, UpdateMealDto } from './dto';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        foods: dto.foods,
        totalCalories: dto.totalCalories,
        totalProtein: dto.totalProtein,
        totalCarbs: dto.totalCarbs,
        totalFat: dto.totalFat,
        imageUrl: dto.imageUrl,
        consumedAt: dto.consumedAt || new Date(),
      },
    });

    return meal;
  }

  async findAll(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.consumedAt = {};
      if (startDate) where.consumedAt.gte = startDate;
      if (endDate) where.consumedAt.lte = endDate;
    }

    return this.prisma.meal.findMany({
      where,
      orderBy: { consumedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return meal;
  }

  async update(id: string, userId: string, dto: UpdateMealDto) {
    await this.findOne(id, userId);

    return this.prisma.meal.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.meal.delete({
      where: { id },
    });
  }

  async getDailySummary(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const summary = meals.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + meal.totalCalories,
        totalProtein: acc.totalProtein + meal.totalProtein,
        totalCarbs: acc.totalCarbs + meal.totalCarbs,
        totalFat: acc.totalFat + meal.totalFat,
        mealCount: acc.mealCount + 1,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealCount: 0 },
    );

    return {
      date,
      meals,
      summary,
    };
  }
}
