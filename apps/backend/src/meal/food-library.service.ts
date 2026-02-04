import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class FoodLibraryService {
  private readonly logger = new Logger(FoodLibraryService.name);
  
  private readonly FATSECRET_CLIENT_ID = 'fd86cd17944143efa37de75d4ecab223';
  private readonly FATSECRET_CLIENT_SECRET = '18216b7807bb4b3cadd7000d30f6ea2a';
  private readonly AI_SERVICE_URL = 'http://localhost:8000/api/analyze-text';
  
  private accessToken: string | null = null;
  private tokenExpires: number = 0;

  constructor(private prisma: PrismaService) {}

  private async getAccessToken() {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpires) return this.accessToken;

    this.logger.log('Đang lấy Access Token mới từ FatSecret...');
    const auth = Buffer.from(`${this.FATSECRET_CLIENT_ID}:${this.FATSECRET_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://oauth.fatsecret.com/connect/token',
      qs.stringify({ grant_type: 'client_credentials', scope: 'basic' }),
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpires = now + response.data.expires_in * 1000;
    return this.accessToken;
  }

  async searchFood(query: string) {
    const normalizedQuery = query.toLowerCase().trim();

    // LỚP 1: LOCAL DATABASE
    const localResults = await this.prisma.foodLibrary.findMany({
      where: { name: { contains: normalizedQuery, mode: 'insensitive' } },
      take: 5,
    });

    if (localResults.length > 0) return localResults;

    // LỚP 2: GEMINI AI (Hoặc AI Service của bạn)
    // Chúng ta ưu tiên AI trước FatSecret vì AI hiểu được "Phở Bò thêm gân"
    const aiResult = await this.callAIService(normalizedQuery);
    if (aiResult) return [aiResult];

    // LỚP 3: FATSECRET (Dự phòng cuối cùng)
    const fatSecretResult = await this.findFatSecretNutrition(normalizedQuery);
    return fatSecretResult ? [fatSecretResult] : [];
  }

  // async findNutrition(query: string) {
  //   const normalizedQuery = query.toLowerCase().trim();

  //   const localFood = await this.prisma.foodLibrary.findFirst({
  //     where: { name: { contains: normalizedQuery, mode: 'insensitive' } },
  //   });
  //   if (localFood) return localFood;

  //   try {
  //   const token = await this.getAccessToken();
    
  //   // 1. Tìm kiếm thực phẩm (Sử dụng URL mới theo tài liệu)
  //   const searchRes = await axios.get('https://platform.fatsecret.com/rest/foods/search/v1', {
  //     params: {
  //       search_expression: query,
  //       format: 'json',
  //       max_results: 1
  //     },
  //     headers: { Authorization: `Bearer ${token}` }
  //   });

  //   const foodFound = searchRes.data.foods?.food;
  //   this.logger.log(`FatSecret tìm kiếm [${query}]: ${foodFound ? 'Thấy' : 'Không thấy'}`);

  //   if (foodFound) {
  //     // 2. Lấy chi tiết - Sử dụng food.get.v4 hoặc v5 như tài liệu hướng dẫn
  //     const detailRes = await axios.get('https://platform.fatsecret.com/rest/food/v4', {
  //       params: {
  //         food_id: foodFound.food_id,
  //         format: 'json'
  //       },
  //       headers: { Authorization: `Bearer ${token}` }
  //     });

  //     const servings = detailRes.data.food.servings.serving;
  //     const nutrients = Array.isArray(servings) ? servings[0] : servings;
      
  //     if (nutrients) {
  //       return await this.prisma.foodLibrary.create({
  //         data: {
  //           name: foodFound.food_name,
  //           calories: parseFloat(nutrients.calories) || 0,
  //           protein: parseFloat(nutrients.protein) || 0,
  //           carbs: parseFloat(nutrients.carbohydrate) || 0,
  //           fat: parseFloat(nutrients.fat) || 0,
  //           servingSize: `${nutrients.metric_serving_amount || 100}${nutrients.metric_serving_unit || 'g'}`,
  //         },
  //       });
  //     }
  //   }
  // } catch (error: any) {
  //   this.logger.error(`[FatSecret Error]: ${error.response?.data?.error?.message || error.message}`);
  // }

  // // Luôn gọi AI nếu FatSecret không có kết quả
  // return this.callAIService(query);

  // }

  private async callAIService(query: string) {
    this.logger.log(`[AI] Đang phân tích: ${query}`);
    try {
      const response = await axios.post(this.AI_SERVICE_URL, { text: query });
      const aiData = response.data;

      // Giả sử AI trả về: { name, calories, protein, carbs, fat, servingSize }
      if (aiData && !aiData.error) {
        return await this.prisma.foodLibrary.create({
          data: {
            name: aiData.name || query,
            calories: aiData.calories || 0,
            protein: aiData.protein || 0,
            carbs: aiData.carbs || 0,
            fat: aiData.fat || 0,
            servingSize: aiData.servingSize || '100g',
          },
        });
      }
    } catch (error) {
      this.logger.warn(`[AI Service] Không phản hồi hoặc lỗi. Chuyển hướng dự phòng...`);
      return null;
    }
  }

  private async findFatSecretNutrition(query: string) {
    try {
      const token = await this.getAccessToken();
      // Thực hiện gọi FatSecret như cũ ở đây...
      // (Giữ nguyên logic search v1 và get v5 của bạn)
      // 1. Tìm kiếm thực phẩm (Sử dụng URL mới theo tài liệu)
    const searchRes = await axios.get('https://platform.fatsecret.com/rest/foods/search/v1', {
      params: {
        search_expression: query,
        format: 'json',
        max_results: 1
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    const foodFound = searchRes.data.foods?.food;
    this.logger.log(`FatSecret tìm kiếm [${query}]: ${foodFound ? 'Thấy' : 'Không thấy'}`);

    if (foodFound) {
      // 2. Lấy chi tiết - Sử dụng food.get.v4 hoặc v5 như tài liệu hướng dẫn
      const detailRes = await axios.get('https://platform.fatsecret.com/rest/food/v4', {
        params: {
          food_id: foodFound.food_id,
          format: 'json'
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const servings = detailRes.data.food.servings.serving;
      const nutrients = Array.isArray(servings) ? servings[0] : servings;
      
      if (nutrients) {
        return await this.prisma.foodLibrary.create({
          data: {
            name: foodFound.food_name,
            calories: parseFloat(nutrients.calories) || 0,
            protein: parseFloat(nutrients.protein) || 0,
            carbs: parseFloat(nutrients.carbohydrate) || 0,
            fat: parseFloat(nutrients.fat) || 0,
            servingSize: `${nutrients.metric_serving_amount || 100}${nutrients.metric_serving_unit || 'g'}`,
          },
        });
      }
    }
  } catch (error: any) {
    this.logger.error(`[FatSecret Error]: ${error.response?.data?.error?.message || error.message}`);
  }
  }
}