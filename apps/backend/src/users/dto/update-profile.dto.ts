import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ActivityLevel, Goal } from '@prisma/client'; // Import Enum từ Prisma để chuẩn hóa

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;
}