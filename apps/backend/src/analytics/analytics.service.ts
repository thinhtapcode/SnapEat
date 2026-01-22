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

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progressData = await this.prisma.progress.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (progressData.length === 0) {
      return {
        period,
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        weightChange: 0,
        adherenceRate: 0,
        dataPoints: 0,
      };
    }

    const totals = progressData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.caloriesConsumed,
        protein: acc.protein + day.proteinConsumed,
        carbs: acc.carbs + day.carbsConsumed,
        fat: acc.fat + day.fatConsumed,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const count = progressData.length;
    const firstWeight = progressData[0]?.weight || 0;
    const lastWeight = progressData[progressData.length - 1]?.weight || 0;

    return {
      period,
      averageCalories: Math.round(totals.calories / count),
      averageProtein: Math.round(totals.protein / count),
      averageCarbs: Math.round(totals.carbs / count),
      averageFat: Math.round(totals.fat / count),
      weightChange: Math.round((lastWeight - firstWeight) * 10) / 10,
      adherenceRate: Math.round((count / days) * 100),
      dataPoints: count,
    };
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
