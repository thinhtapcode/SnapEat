import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TdeeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
   */
  private calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: string,
  ): number {
    // weight in kg, height in cm
    const baseCalories = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === 'male') {
      return baseCalories + 5;
    } else {
      return baseCalories - 161;
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  private calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };

    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  /**
   * Calculate recommended calories based on goal
   */
  private calculateRecommendedCalories(tdee: number, goal: string): number {
    const goalAdjustments = {
      LOSE_WEIGHT: -500,
      MAINTAIN_WEIGHT: 0,
      GAIN_WEIGHT: 500,
      BUILD_MUSCLE: 300,
    };

    return tdee + (goalAdjustments[goal] || 0);
  }

  /**
   * Calculate macro distribution
   */
  private calculateMacros(calories: number, goal: string) {
    let proteinRatio = 0.3;
    let carbsRatio = 0.4;
    let fatRatio = 0.3;

    if (goal === 'BUILD_MUSCLE' || goal === 'GAIN_WEIGHT') {
      proteinRatio = 0.35;
      carbsRatio = 0.45;
      fatRatio = 0.2;
    } else if (goal === 'LOSE_WEIGHT') {
      proteinRatio = 0.4;
      carbsRatio = 0.3;
      fatRatio = 0.3;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbsRatio) / 4), // 4 cal per gram
      fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
    };
  }

  async calculateForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      return {
        error: 'User profile not complete. Please update your profile with age, gender, height, weight, activity level, and goal.',
      };
    }

    const { age, gender, height, weight, activityLevel, goal } = user.profile;

    if (!age || !gender || !height || !weight || !activityLevel || !goal) {
      return {
        error: 'Missing required profile information',
      };
    }

    const bmr = this.calculateBMR(weight, height, age, gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const recommendedCalories = this.calculateRecommendedCalories(tdee, goal);
    const macros = this.calculateMacros(recommendedCalories, goal);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories: Math.round(recommendedCalories),
      macros,
      profile: {
        age,
        gender,
        height,
        weight,
        activityLevel,
        goal,
      },
    };
  }

  async updateProfile(userId: string, profileData: any) {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.prisma.userProfile.update({
        where: { userId },
        data: profileData,
      });
    } else {
      return this.prisma.userProfile.create({
        data: {
          userId,
          ...profileData,
        },
      });
    }
  }
}
