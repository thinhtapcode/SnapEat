import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
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
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/snapeat_logs'),
    AuthModule,
    MealModule,
    TdeeModule,
    MealPlanModule,
    AnalyticsModule,
  ],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
