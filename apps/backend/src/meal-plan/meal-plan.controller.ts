import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('meal-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlanController {
  constructor(private mealPlanService: MealPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal plan' })
  @ApiResponse({ status: 201, description: 'Meal plan created successfully' })
  create(@GetUser('id') userId: string, @Body() dto: CreateMealPlanDto) {
    return this.mealPlanService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal plans' })
  @ApiResponse({ status: 200, description: 'Meal plans retrieved successfully' })
  findAll(@GetUser('id') userId: string) {
    return this.mealPlanService.findAll(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active meal plans' })
  @ApiResponse({ status: 200, description: 'Active meal plans retrieved successfully' })
  findActive(@GetUser('id') userId: string) {
    return this.mealPlanService.findActive(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal plan by ID' })
  @ApiResponse({ status: 200, description: 'Meal plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.mealPlanService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMealPlanDto,
  ) {
    return this.mealPlanService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.mealPlanService.remove(id, userId);
  }
}
