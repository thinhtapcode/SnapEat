import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter'; // 1. Import thêm cái này
import {ScheduleModule} from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module'; // 2. Thêm UserModule
import { MealModule } from './meal/meal.module';
import { TdeeModule } from './tdee/tdee.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './common/prisma.service';
import { RedisService } from './common/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Kích hoạt Event Emitter trên toàn hệ thống
    EventEmitterModule.forRoot({
      wildcard: false, // Không dùng ký tự đại diện cho tên event
      delimiter: '.',  // Phân cách tên event bằng dấu chấm, vd: user.profile.updated
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/snapeat_logs'),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule, // Đưa UserModule vào đây
    MealModule,
    TdeeModule,
    MealPlanModule,
    AnalyticsModule,
  ],
  providers: [PrismaService, RedisService],
  // Export PrismaService ở đây là đúng, giúp các Module khác dùng chung 1 instance
  exports: [PrismaService, RedisService],
})
export class AppModule {}