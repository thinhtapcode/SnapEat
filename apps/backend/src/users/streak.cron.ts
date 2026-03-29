import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class StreakCron {
  private readonly logger = new Logger(StreakCron.name);
  private readonly TZ_VN = 'Asia/Ho_Chi_Minh';

  constructor(private prisma: PrismaService) {}

  // Chạy vào lúc 00:01 mỗi ngày theo giờ Việt Nam
  // Lệnh này sẽ kiểm tra xem ngày hôm qua User có duy trì được Streak không
  @Cron('0 1 0 * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleStreakExpiry() {
    this.logger.log('🕵️  Đang kiểm tra các chuỗi Streak hết hạn...');

    const yesterdayStart = dayjs().tz(this.TZ_VN).subtract(1, 'day').startOf('day');
    const yesterdayEnd = dayjs().tz(this.TZ_VN).subtract(1, 'day').endOf('day');

    try {
      // 1. Tìm tất cả user đang có streak > 0
      const activeStreakUsers = await this.prisma.user.findMany({
        where: {
          currentStreak: { gt: 0 },
        },
      });

      // Lấy ngày hôm qua dưới dạng YYYY-MM-DD (Ví dụ: 2026-03-21)
      const yesterdayStr = dayjs().tz(this.TZ_VN).subtract(1, 'day').format('YYYY-MM-DD');

      for (const user of activeStreakUsers) {
        if (!user.lastStreakAt) {
          // Không có ngày streak mà dám có currentStreak > 0 -> Reset luôn!
          await this.resetStreak(user.id);
          continue;
        }

        // Chuyển ngày streak của User về YYYY-MM-DD (Ví dụ: 2026-03-14)
        const lastStreakStr = dayjs(user.lastStreakAt).tz(this.TZ_VN).format('YYYY-MM-DD');

        // 🔥 SO SÁNH: Nếu ngày streak cuối cùng bé hơn hẳn ngày hôm qua -> Đứt chuỗi!
        const isBroken = dayjs(lastStreakStr).isBefore(dayjs(yesterdayStr), 'day'); // So sánh theo đơn vị 'day'

        if (isBroken) {
          await this.resetStreak(user.id);
          this.logger.log(`💔 User ${user.id} đứt chuỗi. (Streak cuối: ${lastStreakStr}, Hôm qua là: ${yesterdayStr})`);
        }
      }

      this.logger.log('✅ Hoàn tất kiểm tra Streak hàng ngày.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Lỗi khi chạy Cron Streak:', errorMsg);
    }
  }
  async resetStreak(userId: string) {
  await this.prisma.user.update({
    where: { id: userId },
    data: { currentStreak: 0 },
  });
}
}