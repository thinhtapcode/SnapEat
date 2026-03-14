import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMealDto, UpdateMealDto } from './dto';
import { StreakService } from '../users/streak.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class MealService {
  constructor(
    private prisma: PrismaService,
    private streakService: StreakService, // Inject Service quản lý Streak
  ) {}

  /**
   * Tạo bữa ăn mới và kiểm tra Streak
   */
  async create(userId: string, dto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        foods: dto.foods,
        totalCalories: Number(dto.totalCalories),
        totalProtein: Number(dto.totalProtein),
        totalCarbs: Number(dto.totalCarbs),
        totalFat: Number(dto.totalFat),
        imageUrl: dto.imageUrl,
        consumedAt: dto.consumedAt ? new Date(dto.consumedAt) : new Date(),
      },
    });

    // Kích hoạt kiểm tra Streak ngay khi dữ liệu thay đổi
    await this.streakService.checkAndUpdateStreak(userId);

    return meal;
  }

  /**
   * Lấy danh sách bữa ăn theo khoảng thời gian
   */
  async findAll(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.consumedAt = {};
      if (startDate) where.consumedAt.gte = new Date(startDate);
      if (endDate) where.consumedAt.lte = new Date(endDate);
    }

    return this.prisma.meal.findMany({
      where,
      orderBy: { consumedAt: 'desc' },
    });
  }

  /**
   * Tìm chi tiết một bữa ăn
   */
  async findOne(id: string, userId: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      throw new NotFoundException('Không tìm thấy bữa ăn này.');
    }

    return meal;
  }

  /**
   * Cập nhật bữa ăn và tính toán lại Streak
   */
  async update(id: string, userId: string, dto: UpdateMealDto) {
    await this.findOne(id, userId);

    const updatedMeal = await this.prisma.meal.update({
      where: { id },
      data: {
        ...dto,
        // Đảm bảo ép kiểu số nếu dữ liệu từ DTO gửi lên là chuỗi
        totalCalories: dto.totalCalories ? Number(dto.totalCalories) : undefined,
        totalProtein: dto.totalProtein ? Number(dto.totalProtein) : undefined,
        totalCarbs: dto.totalCarbs ? Number(dto.totalCarbs) : undefined,
        totalFat: dto.totalFat ? Number(dto.totalFat) : undefined,
      },
    });

    // Sau khi sửa món ăn, tổng calo thay đổi -> Check lại streak
    await this.streakService.checkAndUpdateStreak(userId);

    return updatedMeal;
  }

  /**
   * Xóa bữa ăn và tính toán lại Streak
   */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const deletedMeal = await this.prisma.meal.delete({
      where: { id },
    });

    // Sau khi xóa món ăn, có thể user từ "đủ calo" thành "thiếu calo" -> Cần check lại
    await this.streakService.checkAndUpdateStreak(userId);

    return deletedMeal;
  }

  /**
   * Lấy tóm tắt dinh dưỡng trong ngày kèm số Streak mới nhất
   */
  async getDailySummary(userId: string, date: Date) {
    const vnNow = dayjs().tz('Asia/Ho_Chi_Minh');
    const startOfDay = vnNow.startOf('day').toDate();
    const endOfDay = vnNow.endOf('day').toDate();

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        consumedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const summary = meals.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + (meal.totalCalories || 0),
        totalProtein: acc.totalProtein + (meal.totalProtein || 0),
        totalCarbs: acc.totalCarbs + (meal.totalCarbs || 0),
        totalFat: acc.totalFat + (meal.totalFat || 0),
        mealCount: acc.mealCount + 1,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealCount: 0 },
    );

    // Lấy thông tin Streak từ User để trả về cho Frontend
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastStreakAt: true }
    });

    return {
      date: startOfDay,
      meals,
      summary,
      streak: {
        current: user?.currentStreak || 0,
        lastAchieved: user?.lastStreakAt
      }
    };
  }
}