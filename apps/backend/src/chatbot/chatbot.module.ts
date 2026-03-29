// apps/backend/src/chatbot/chatbot.module.ts
import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { FoodLibraryModule } from '../meal/food-library.module';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FoodLibraryModule, AuthModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, PrismaService],
})
export class ChatbotModule { }