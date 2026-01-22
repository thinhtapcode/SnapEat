import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export class CreateMealDto {
  @ApiProperty({ example: 'Chicken Salad' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MealType, example: MealType.LUNCH })
  @IsEnum(MealType)
  type: MealType;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  foods: any[];

  @ApiProperty({ example: 450.5 })
  @IsNumber()
  totalCalories: number;

  @ApiProperty({ example: 35.2 })
  @IsNumber()
  totalProtein: number;

  @ApiProperty({ example: 25.8 })
  @IsNumber()
  totalCarbs: number;

  @ApiProperty({ example: 18.3 })
  @IsNumber()
  totalFat: number;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  consumedAt?: Date;
}

export class UpdateMealDto extends PartialType(CreateMealDto) {}
