import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MealService } from './meal.service';
import { CreateMealDto, UpdateMealDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('meals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealController {
  constructor(private mealService: MealService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  create(@GetUser('id') userId: string, @Body() dto: CreateMealDto) {
    return this.mealService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals for user' })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully' })
  findAll(
    @GetUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.mealService.findAll(userId, start, end);
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily meal summary' })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved successfully' })
  getDailySummary(
    @GetUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.mealService.getDailySummary(userId, targetDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.mealService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.mealService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meal' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.mealService.remove(id, userId);
  }
}
