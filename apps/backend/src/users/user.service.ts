import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async updateProfile(userId: string, data: any) {
    try {
      // 1. Dùng upsert: Nếu chưa có profile thì tạo mới, có rồi thì cập nhật
      const updatedUser = await this.prisma.userProfile.upsert({
        where: { userId },
        update: {
          ...data,
          // Đảm bảo các chỉ số sức khỏe là kiểu số (đề phòng frontend gửi string)
          age: data.age ? Number(data.age) : undefined,
          height: data.height ? Number(data.height) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
        },
        create: {
          userId,
          ...data,
          age: data.age ? Number(data.age) : 0,
          height: data.height ? Number(data.height) : 0,
          weight: data.weight ? Number(data.weight) : 0,
          gender: data.gender || 'OTHER',
          activityLevel: data.activityLevel || 'SEDENTARY',
          goal: data.goal || 'MAINTAIN',
        },
      });

      // 2. Bắn Event "user.profile.updated"
      // Chúng ta dùng data từ updatedUser (đã sạch) để đảm bảo TDEE Service nhận dữ liệu chuẩn
      this.eventEmitter.emit('user.profile.updated', {
        userId: updatedUser.userId,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        activityLevel: updatedUser.activityLevel,
        goal: updatedUser.goal,
      });

      return updatedUser;
    } catch (error) {
      console.error('Lỗi khi cập nhật profile:', error);
      throw new InternalServerErrorException('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
    }
  }
}