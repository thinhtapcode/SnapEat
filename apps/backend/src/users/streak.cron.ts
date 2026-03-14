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

      for (const user of activeStreakUsers) {
        // Nếu hôm qua (yesterday) không có bản ghi lastStreakAt, 
        // nghĩa là hôm qua họ đã không đạt mục tiêu -> Reset về 0
        const lastStreakAtVN = user.lastStreakAt 
          ? dayjs(user.lastStreakAt).tz(this.TZ_VN) 
          : null;

        const isMaintainedYesterday = lastStreakAtVN && 
          lastStreakAtVN.isAfter(yesterdayStart) && 
          lastStreakAtVN.isBefore(yesterdayEnd);

        if (!isMaintainedYesterday) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { currentStreak: 0 },
          });
          this.logger.log(`💔 User ${user.id} đã đứt chuỗi Streak.`);
        }
      }

      this.logger.log('✅ Hoàn tất kiểm tra Streak hàng ngày.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Lỗi khi chạy Cron Streak:', errorMsg);
    }
  }
}