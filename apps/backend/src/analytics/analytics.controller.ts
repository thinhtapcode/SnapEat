import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track daily progress' })
  @ApiResponse({ status: 201, description: 'Progress tracked successfully' })
  trackProgress(
    @GetUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.analyticsService.trackProgress(userId, targetDate);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get progress history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getHistory(
    @GetUser('id') userId: string,
    @Query('days') days?: string,
  ) {
    const numDays = days ? parseInt(days) : 30;
    return this.analyticsService.getProgressHistory(userId, numDays);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  getSummary(
    @GetUser('id') userId: string,
    @Query('period') period: 'week' | 'month' | 'year' = 'week',
  ) {
    return this.analyticsService.getSummary(userId, period);
  }

  @Get('weekly-comparison')
  @ApiOperation({ summary: 'Compare this week vs last week' })
  @ApiResponse({ status: 200, description: 'Comparison retrieved successfully' })
  getWeeklyComparison(@GetUser('id') userId: string) {
    return this.analyticsService.getWeeklyComparison(userId);
  }
}
