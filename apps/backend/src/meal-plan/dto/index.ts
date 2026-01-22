import { IsString, IsNumber, IsDateString, IsObject, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty({ example: 'My Weekly Plan' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  dailyCalories: number;

  @ApiProperty({ type: 'object', example: { protein: 150, carbs: 200, fat: 65 } })
  @IsObject()
  dailyMacros: any;

  @ApiProperty({ type: 'array', items: { type: 'object' }, required: false })
  @IsOptional()
  @IsArray()
  meals?: any[];
}

export class UpdateMealPlanDto extends PartialType(CreateMealPlanDto) {}
