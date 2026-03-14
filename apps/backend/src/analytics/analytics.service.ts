import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6); // Lấy 7 ngày bao gồm cả hôm nay

    // 1. Lấy dữ liệu mục tiêu từ UserProfile
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { targetCalories: true, targetProtein: true, targetCarbs: true, targetFat: true }
    });

    // 2. Lấy dữ liệu thực tế từ Meal trong 7 ngày qua
    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        consumedAt: { gte: startOfDay(sevenDaysAgo), lte: endOfDay(today) }
      },
      orderBy: { consumedAt: 'asc' }
    });

    // Gom nhóm dữ liệu theo ngày cho Trends (Usecase 1 & 3)
    const trendsMap = new Map();
    // Khởi tạo 7 ngày trống để biểu đồ không bị đứt đoạn
    for (let i = 0; i < 7; i++) {
      const dateStr = subDays(today, i).toLocaleDateString('vi-VN', { weekday: 'short' });
      trendsMap.set(dateStr, { actualCal: 0, protein: 0, carbs: 0, fat: 0 });
    }

    meals.forEach(meal => {
      const dateStr = new Date(meal.consumedAt).toLocaleDateString('vi-VN', { weekday: 'short' });
      const current = trendsMap.get(dateStr) || { actualCal: 0, protein: 0, carbs: 0, fat: 0 };
      trendsMap.set(dateStr, {
        actualCal: current.actualCal + meal.totalCalories,
        protein: current.protein + meal.totalProtein,
        carbs: current.carbs + meal.totalCarbs,
        fat: current.fat + meal.totalFat,
      });
    });

    const trends = Array.from(trendsMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        targetCal: profile?.targetCalories || 0
      })).reverse();

    // 3. Phân bổ bữa ăn (Usecase 2)
    const mealDist = await this.prisma.meal.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { totalCalories: true }
    });

    // 4. Tính Adherence Score (Usecase 4)
    // Giả định đạt kỷ luật nếu sai số Calo < 10%
    const successfulDays = trends.filter(d => 
      d.actualCal > 0 && Math.abs(d.actualCal - d.targetCal) < (d.targetCal * 0.1)
    ).length;
    const adherenceScore = Math.round((successfulDays / 7) * 100);

    return {
      trends,
      mealDistribution: mealDist.map(d => ({ type: d.type, calories: d._sum.totalCalories })),
      adherenceScore,
      target: profile
    };
  }
}