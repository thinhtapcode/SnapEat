import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TdeeService } from './tdee.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('tdee')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tdee')
export class TdeeController {
  constructor(private tdeeService: TdeeService) {}

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate TDEE and recommended calories' })
  @ApiResponse({ status: 200, description: 'TDEE calculated successfully' })
  calculate(@GetUser('id') userId: string) {
    return this.tdeeService.calculateForUser(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.tdeeService.updateProfile(userId, dto);
  }
}
