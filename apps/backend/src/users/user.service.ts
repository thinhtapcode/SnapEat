import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter'; // Cần cài @nestjs/event-emitter

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async updateProfile(userId: string, data: any) {
    // 1. Cập nhật Source of Truth tại User Service
    const updatedUser = await this.prisma.userProfile.update({
      where: { userId },
      data: data,
    });

    // 2. Bắn Event "user.profile.updated" kèm theo dữ liệu cần thiết
    // TDEE Service sẽ nghe event này để cập nhật bản sao (Data Replication)
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
  }
}