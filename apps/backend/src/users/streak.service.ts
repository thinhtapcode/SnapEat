import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import  dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);
  private readonly TZ_VN = 'Asia/Ho_Chi_Minh';

  constructor(private prisma: PrismaService) {}

  async checkAndUpdateStreak(userId: string) {
    const nowInVN = dayjs().tz(this.TZ_VN);
    const todayStart = nowInVN.startOf('day');
    const todayEnd = nowInVN.endOf('day');
  
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  // LOG 1: Kiểm tra xem có tìm thấy User và Profile không
  if (!user || !user.profile) {
    console.log("❌ Lỗi: Không tìm thấy User hoặc Profile");
    return;
  }

  const goal = user.profile.targetCalories;
  // LOG 2: Kiểm tra mục tiêu Calo
  if (!goal || goal <= 0) {
    console.log("❌ Lỗi: Chưa thiết lập targetCalories trong Profile");
    return;
  }

  // Lấy tổng Calo đã ăn hôm nay trực tiếp từ bảng Meal
  const mealsToday = await this.prisma.meal.findMany({
      where: {
        userId,
        consumedAt: {
          gte: todayStart.toDate(),
          lte: todayEnd.toDate(),
        },
      },
    });

  const totalConsumed = mealsToday.reduce((sum, m) => sum + m.totalCalories, 0);
  const isMet = totalConsumed >= goal * 0.9 && totalConsumed <= goal * 1.1;

  // LOG 3: Kiểm tra điều kiện đạt mục tiêu
  console.log(`Check: Ăn ${totalConsumed} / Mục tiêu ${goal} -> Đạt: ${isMet}`);

  if (isMet) {
      // 3. So sánh ngày streak cuối cùng cũng theo giờ Việt Nam
      const lastStreakAtVN = user.lastStreakAt 
        ? dayjs(user.lastStreakAt).tz(this.TZ_VN).startOf('day') 
        : null;

      this.logger.log(`Ngày Streak cuối: ${lastStreakAtVN?.format('YYYY-MM-DD') || 'Chưa có'}`);

      // Nếu chưa có streak hoặc ngày streak cuối là trước hôm nay
      if (!lastStreakAtVN || lastStreakAtVN.isBefore(todayStart)) {
        this.logger.log("ĐIỀU KIỆN ĐỦ! Đang tiến hành cập nhật Streak...");
        
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: { increment: 1 },
            lastStreakAt: nowInVN.toDate(), // Lưu thời điểm hiện tại (đã convert sang Date object)
          },
        });
        
        this.logger.log(`Cập nhật thành công. Streak mới: ${updated.currentStreak}`);
      } else {
        this.logger.log("Thông báo: Hôm nay bạn đã được cộng streak rồi.");
      }
    }
  }
}