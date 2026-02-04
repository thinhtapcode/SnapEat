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
      consumedAt: { gte: startOfDay, lte: endOfDay },
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

  // --- LOGIC MỚI: Tự động chạy Streak nếu là ngày hôm nay ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // So sánh nếu 'date' truyền vào là ngày hôm nay
  if (startOfDay.getTime() === today.getTime()) {
    await this.checkAndUpdateStreak(userId);
  }

  // Lấy lại thông tin user để có số streak mới nhất sau khi update
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true }
  });

  return {
    date,
    meals,
    summary,
    currentStreak: user?.currentStreak || 0, // Trả về streak mới nhất
  };
}
  async checkAndUpdateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 1. Tính tổng calo hôm nay
  const mealsToday = await this.prisma.meal.findMany({
    where: {
      userId,
      consumedAt: { gte: today, lt: tomorrow },
    },
  });

  const totalCalories = mealsToday.reduce((sum, m) => sum + m.totalCalories, 0);

  // 2. Lấy User Profile để biết Goal
  const user = await this.prisma.user.findUnique({ 
    where: { id: userId },
    include: { profile: true }
  });

  if (!user || !user.profile) return;

  // Lấy targetCalories từ Profile, nếu chưa có thì mặc định 2000
  const goal = user.profile.targetCalories || 2000;

  // --- LOGIC SO SÁNH CHÍNH XÁC ---
  // Streak tăng nếu Calo tiêu thụ nằm trong khoảng 90% - 110% của Goal
  const lowerBound = goal * 0.9;
  const upperBound = goal * 1.1;
  const isGoalMet = totalCalories >= lowerBound && totalCalories <= upperBound;

  if (isGoalMet) {
    const lastStreak = user.lastStreakAt ? new Date(user.lastStreakAt) : null;
    if (lastStreak) lastStreak.setHours(0, 0, 0, 0);

    if (!lastStreak || lastStreak.getTime() < today.getTime()) {
      let newStreak = user.currentStreak + 1;
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStreak && lastStreak.getTime() < yesterday.getTime()) {
        newStreak = 1; 
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { currentStreak: newStreak, lastStreakAt: today }
      });
    }
  }
}
  
}
