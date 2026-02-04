import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealPlanDto) {
    const macros = dto.dailyMacros || { protein: 0, carbs: 0, fat: 0 };
    return this.prisma.mealPlan.create({
      data: {
        userId,
        name: dto.name,
        startDate: new Date(dto.startDate), 
        endDate: new Date(dto.endDate),
        dailyCalories: Number(dto.dailyCalories),
        dailyMacros: {
          protein: Number(dto.dailyMacros.protein),
          carbs: Number(dto.dailyMacros.carbs),
          fat: Number(dto.dailyMacros.fat),
        }as any,  
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

  // Trong UserService hoặc MealPlanService
async applyTemplateToUser(userId: string, planId: string) {
  // 1. Lấy thông tin plan
  const plan = await this.prisma.mealPlan.findFirst({
    where: { id: planId, userId },
  });

  if (!plan) throw new NotFoundException('Meal plan not found');

  // 2. Ép kiểu Json từ dailyMacros để lấy giá trị
  const macros = plan.dailyMacros as any; 
  
  // 3. Cập nhật vào UserProfile (Dùng đúng tên trường bạn vừa thêm ở bước trên)
  return this.prisma.userProfile.update({
    where: { userId },
    data: {
      targetCalories: plan.dailyCalories,
      targetProtein:  Number(macros.protein),
      targetCarbs:    Number(macros.carbs),
      targetFat:      Number(macros.fat),
    },
  });
}
}

