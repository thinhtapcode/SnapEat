// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: ActivityLevel;
  goal?: Goal;
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTRA_ACTIVE = 'EXTRA_ACTIVE',
}

export enum Goal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  MAINTAIN_WEIGHT = 'MAINTAIN_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
  BUILD_MUSCLE = 'BUILD_MUSCLE',
}

// Meal types
export interface Meal {
  id: string;
  userId: string;
  name: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
  consumedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  quantity: number;
}

// TDEE Calculation
export interface TDEEResult {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  macros: MacroDistribution;
}

export interface MacroDistribution {
  protein: number;
  carbs: number;
  fat: number;
}

// Meal Plan
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  dailyCalories: number;
  dailyMacros: MacroDistribution;
  meals: PlannedMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedMeal {
  id: string;
  dayOfWeek: number; // 0-6
  mealType: MealType;
  name: string;
  foods: FoodItem[];
  totalCalories: number;
}

// Analytics
export interface ProgressData {
  userId: string;
  date: Date;
  weight?: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
}

export interface AnalyticsSummary {
  period: 'week' | 'month' | 'year';
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  weightChange?: number;
  adherenceRate: number;
}

// AI Recognition
export interface FoodRecognitionRequest {
  imageData: string; // base64 encoded
}

export interface FoodRecognitionResponse {
  success: boolean;
  foods: RecognizedFood[];
  confidence: number;
}

export interface RecognizedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
