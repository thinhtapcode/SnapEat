import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async sendMessage(
    @Body() body: { message: string; history: { role: 'user' | 'model'; text: string }[] },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.chatbotService.chatWithUser(userId, body.message, body.history);
  }
}