import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../common/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StreakService } from './streak.service';
import { StreakCron } from './streak.cron';

@Module({
  imports: [
    // Khai báo EventEmitterModule để sử dụng được EventEmitter2 trong UserService
    EventEmitterModule.forRoot(),
  ],
  controllers: [UserController],
  providers: [
    UserService, 
    PrismaService // Đảm bảo PrismaService được cung cấp để thao tác Database
    , StreakService, StreakCron
  ],
  exports: [UserService, StreakService], // Export nếu các module khác cần dùng đến logic của User
})
export class UserModule {}