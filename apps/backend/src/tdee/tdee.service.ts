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
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return { error: 'User profile not found.' };
    }

    const { age, gender, height, weight, activityLevel, goal } = userProfile;

    // Kiểm tra thông tin cơ bản để tính recommend
    if (!age || !gender || !height || !weight || !activityLevel || !goal) {
      return { 
        profile: userProfile,
        error: 'Thông tin sinh học chưa đầy đủ để tính toán khuyến nghị.' 
      };
    }

    // 1. Tính toán số khuyến nghị (Recommended) theo công thức khoa học
    const bmr = this.calculateBMR(weight, height, age, gender);
    const tdeeValue = this.calculateTDEE(bmr, activityLevel);
    const recommendedCalories = this.calculateRecommendedCalories(tdeeValue, goal);
    const recommendedMacros = this.calculateMacros(recommendedCalories, goal);

    // 2. Trả về cấu trúc mà Frontend đang mong đợi
    return {
      profile: userProfile,
      recommend: {
        bmr: Math.round(bmr),
        calories: Math.round(recommendedCalories),
        macros: recommendedMacros,
      },
      // Nếu user đã được áp dụng một Meal Plan (có targetCalories), trả về current
      current: userProfile.targetCalories ? {
        calories: Math.round(userProfile.targetCalories),
        macros: {
          protein: userProfile.targetProtein,
          carbs: userProfile.targetCarbs,
          fat: userProfile.targetFat,
        }
      } : null
    };
  }

  // Hàm Reset mục tiêu (đã có trong controller của bạn)
  async handleResetToRecommend(userId: string) {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      throw new Error('Không tìm thấy Profile người dùng.');
    }

    // 2. Kiểm tra xem có đủ thông số để tính không
    const { age, gender, height, weight, activityLevel, goal } = userProfile;
    if (!age || !gender || !height || !weight || !activityLevel || !goal) {
       // Nếu thiếu thông số, lúc này mới nên để null vì không tính được
       return this.prisma.userProfile.update({
        where: { userId },
        data: { targetCalories: null, targetProtein: null, targetCarbs: null, targetFat: null },
      });
    }

    // 3. Tính toán con số khuyến nghị "chuẩn" của hệ thống
    const bmr = this.calculateBMR(weight, height, age, gender);
    const tdeeValue = this.calculateTDEE(bmr, activityLevel);
    const calories = Math.round(this.calculateRecommendedCalories(tdeeValue, goal));
    const macros = this.calculateMacros(calories, goal);

    // 4. Cập nhật vào DB (Chốt số để Streak chạy)
    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        targetCalories: calories,
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFat: macros.fat,
      },
    });
  }


  async updateProfile(userId: string, profileData: any) {
    // 1. Cập nhật các thông tin cơ bản trước (Tuổi, Cao, Nặng...)
    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    });

    // 2. TỰ ĐỘNG CẬP NHẬT MỤC TIÊU (Nếu đủ thông số)
    // Việc này giúp StreakService luôn có "targetCalories" để so sánh
    const { age, gender, height, weight, activityLevel, goal } = updatedProfile;
    
    if (age && gender && height && weight && activityLevel && goal) {
      const bmr = this.calculateBMR(weight, height, age, gender);
      const tdeeValue = this.calculateTDEE(bmr, activityLevel);
      const calories = Math.round(this.calculateRecommendedCalories(tdeeValue, goal));
      const macros = this.calculateMacros(calories, goal);

      return this.prisma.userProfile.update({
        where: { userId },
        data: {
          targetCalories: calories,
          targetProtein: macros.protein,
          targetCarbs: macros.carbs,
          targetFat: macros.fat,
        },
      });
    }

    return updatedProfile;
  }
  
}
