import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTRA_ACTIVE = 'EXTRA_ACTIVE',
}

enum Goal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  MAINTAIN_WEIGHT = 'MAINTAIN_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
  BUILD_MUSCLE = 'BUILD_MUSCLE',
}

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ required: false, example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: 175 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false, example: 75 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ required: false, enum: ActivityLevel })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiProperty({ required: false, enum: Goal })
  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @ApiProperty({ required: false, example: 2700, description: 'Manual daily caloric intake override' })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiProperty({ required: false, example: 30, description: 'Protein percentage of daily calories (0-100)' })
  @IsOptional()
  @IsNumber()
  proteinPercentage?: number;
}
