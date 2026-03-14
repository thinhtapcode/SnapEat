import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class MealPlanService {
  private readonly TZ_VN = 'Asia/Ho_Chi_Minh';

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealPlanDto) {
    // Ép ngày bắt đầu về 00:00:00 và ngày kết thúc về 23:59:59 giờ VN 
    // để tránh việc Plan bị hết hạn sớm 7 tiếng do lệch UTC
    const startDateVN = dayjs.tz(dto.startDate, this.TZ_VN).startOf('day').toDate();
    const endDateVN = dayjs.tz(dto.endDate, this.TZ_VN).endOf('day').toDate();

    return this.prisma.mealPlan.create({
      data: {
        userId,
        name: dto.name,
        startDate: startDateVN, 
        endDate: endDateVN,
        dailyCalories: Number(dto.dailyCalories),
        dailyMacros: {
          protein: Number(dto.dailyMacros.protein),
          carbs: Number(dto.dailyMacros.carbs),
          fat: Number(dto.dailyMacros.fat),
        } as any,  
        meals: dto.meals || [],
      },
    });
  }

  async findActive(userId: string) {
    // Lấy thời điểm hiện tại theo giờ VN
    const nowVN = dayjs().tz(this.TZ_VN).toDate();

    return this.prisma.mealPlan.findMany({
      where: {
        userId,
        startDate: { lte: nowVN },
        endDate: { gte: nowVN },
      },
    });
  }

  // Các hàm findAll, findOne, remove giữ nguyên vì dùng ID hoặc List đơn giản
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
    if (!mealPlan) throw new NotFoundException('Meal plan not found');
    return mealPlan;
  }

  async update(id: string, userId: string, dto: UpdateMealPlanDto) {
    await this.findOne(id, userId);
    return this.prisma.mealPlan.update({
      where: { id },
      data: dto,
    });
  }

  async applyTemplateToUser(userId: string, planId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) throw new NotFoundException('Meal plan not found');

    const macros = plan.dailyMacros as any; 
    
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
  async remove(id: string, userId: string) {
    // Tận dụng hàm findOne đã viết sẵn để kiểm tra xem Plan có tồn tại 
    // và có thuộc về user này không trước khi xóa
    await this.findOne(id, userId);

    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }
}