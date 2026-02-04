import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackProgress(userId: string, date: Date) {
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

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    // Get user's current weight
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
    });

    if (existingProgress) {
      return this.prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          weight: userProfile?.weight,
          caloriesConsumed: totals.calories,
          proteinConsumed: totals.protein,
          carbsConsumed: totals.carbs,
          fatConsumed: totals.fat,
        },
      });
    } else {
      return this.prisma.progress.create({
        data: {
          userId,
          date: startOfDay,
          weight: userProfile?.weight,
          caloriesConsumed: totals.calories,
          proteinConsumed: totals.protein,
          carbsConsumed: totals.carbs,
          fatConsumed: totals.fat,
        },
      });
    }
  }

  async getProgressHistory(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.progress.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getSummary(userId: string, period: 'week' | 'month' | 'year') {
  const daysMap = { week: 7, month: 30, year: 365 };
  const days = daysMap[period];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Lấy dữ liệu Progress và Profile (để lấy Target)
  const [progressData, userProfile] = await Promise.all([
    this.prisma.progress.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: 'asc' },
    }),
    this.prisma.userProfile.findUnique({ where: { userId } }),
  ]);

  if (progressData.length === 0) return this.getEmptyResponse(period);

  const target = userProfile?.targetCalories || 2000;
  
  // 2. Tính toán các chỉ số nâng cao
  const chartData = progressData.map(day => ({
    date: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
    consumed: day.caloriesConsumed,
    target: target,
    weight: day.weight,
  }));

  const totalCalories = progressData.reduce((acc, d) => acc + d.caloriesConsumed, 0);
  const avgCalories = totalCalories / progressData.length;
  
  // Tính Adherence: % số ngày ăn trong khoảng +/- 10% Target
  const adherenceDays = progressData.filter(d => 
    d.caloriesConsumed >= target * 0.9 && d.caloriesConsumed <= target * 1.1
  ).length;

  // Dự đoán: Dựa trên thâm hụt (7700 kcal thâm hụt = 1kg giảm)
  const dailyDeficit = target - avgCalories;
  const projectedWeightChange = (dailyDeficit * 30) / 7700; // Dự đoán cho 30 ngày tới
  const currentWeight = progressData[progressData.length - 1].weight || userProfile?.weight || 0;

  return {
    period,
    averageCalories: Math.round(avgCalories),
    weightChange: Math.round(((progressData[progressData.length - 1].weight || 0) - (progressData[0].weight || 0)) * 10) / 10,
    adherenceRate: Math.round((adherenceDays / progressData.length) * 100),
    projectedWeight: Math.round((currentWeight - projectedWeightChange) * 10) / 10,
    chartData, // Dữ liệu cho biểu đồ
    dataPoints: progressData.length,
  };
}

private getEmptyResponse(period: string) {
  return { period, averageCalories: 0, weightChange: 0, adherenceRate: 0, projectedWeight: 0, chartData: [], dataPoints: 0 };
}

  async getWeeklyComparison(userId: string) {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const thisWeekData = await this.prisma.progress.findMany({
      where: {
        userId,
        date: { gte: thisWeekStart },
      },
    });

    const lastWeekData = await this.prisma.progress.findMany({
      where: {
        userId,
        date: {
          gte: lastWeekStart,
          lt: thisWeekStart,
        },
      },
    });

    const calculateAverage = (data: any[]) => {
      if (data.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const totals = data.reduce(
        (acc, day) => ({
          calories: acc.calories + day.caloriesConsumed,
          protein: acc.protein + day.proteinConsumed,
          carbs: acc.carbs + day.carbsConsumed,
          fat: acc.fat + day.fatConsumed,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      return {
        calories: Math.round(totals.calories / data.length),
        protein: Math.round(totals.protein / data.length),
        carbs: Math.round(totals.carbs / data.length),
        fat: Math.round(totals.fat / data.length),
      };
    };

    return {
      thisWeek: calculateAverage(thisWeekData),
      lastWeek: calculateAverage(lastWeekData),
    };
  }
}
