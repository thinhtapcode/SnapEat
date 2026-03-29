import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class FoodLibraryService {
  private readonly logger = new Logger(FoodLibraryService.name);
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    // 🤖 Khởi tạo SDK Gemini trực tiếp trong Service
    this.ai = new GoogleGenAI({ apiKey: process.env.FOODAI_API_KEY! });
  }

  async searchFood(query: string) {
    const normalizedQuery = query.toLowerCase().trim();

    // 🌟 LỚP 1: LOCAL DATABASE (Tìm kiếm ưu tiên hàng đầu)
    const localResults = await this.prisma.foodLibrary.findMany({
      where: { name: { contains: normalizedQuery, mode: 'insensitive' } },
      take: 5,
    });

    if (localResults.length > 0) {
      this.logger.log(`[Local DB] Tìm thấy món: "${normalizedQuery}" trong hệ thống.`);
      return localResults;
    }

    // 🌟 LỚP 2:  AI (Chỉ gọi khi DB rỗng)
    this.logger.log(`[Local DB] Không tìm thấy "${normalizedQuery}". Đang chuyển cho AI...`);
    const aiResult = await this.callAIService(normalizedQuery);

    return aiResult ? [aiResult] : [];
  }

  private async callAIService(query: string) {
    try {
      this.logger.log(`[AI] Đang phân tích dinh dưỡng cho: "${query}"`);

      const prompt = `
      Bạn là Bé Xoài - Trợ lý AI phân tích Calo cho app SnapEat.
      Hãy phân tích giá trị dinh dưỡng cho món ăn: "${query}".

      🎯 Quy tắc chuẩn hóa ép buộc (Rất quan trọng):
      1. Nếu là THỰC PHẨM THÔ/NGUYÊN LIỆU (Ức gà, chuối, gạo...): 
         - servingSize = "Gram"
         - defaultWeight = 100
         - Tính calo cho 100g.
      2. Nếu là MÓN ĂN CHẾ BIẾN/CƠM TIỆM (Phở bò, bánh mì, cơm sườn...):
         - servingSize = "Tô", "Dĩa", "Ổ", "Phần" (Tùy món)
         - defaultWeight = 1 (Tương ứng 1 phần ăn)
         - Tính calo cho 1 phần ăn đó.

      Hãy trả về kết quả dưới dạng JSON thuần túy (KHÔNG CHỨA MARKDOWN), theo đúng Schema sau:
      {
        "name": string (Tên món chuẩn hóa tiếng Việt, ví dụ: "Phở Bò"),
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "servingSize": string (Chỉ chọn 1 trong: "Gram", "Tô", "Dĩa", "Phần", "Ổ", "Cái"),
        "defaultWeight": number (100 đối với Gram, 1 đối với các đơn vị khác)
      }
    `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2, // Giảm temperature để AI bám chặt rules hơn
        }
      });

      const aiData = JSON.parse(response.text);

      // 💾 Insert trực tiếp vào Postgres khớp 100% Prisma Schema
      this.logger.log(`[AI] Phân tích thành công món "${query}". Đang lưu vào DB...`);

      return await this.prisma.foodLibrary.create({
        data: {
          name: aiData.name || query, // Nếu AI quên name thì lấy query cũ
          calories: Number(aiData.calories) || 0,
          protein: Number(aiData.protein) || 0,
          carbs: Number(aiData.carbs) || 0,
          fat: Number(aiData.fat) || 0,
          servingSize: aiData.servingSize || 'Gram',
          defaultWeight: Number(aiData.defaultWeight) || 100,
          isVerified: false, // AI tự tạo nên để false, chờ admin duyệt
        },
      });
    } catch (error) {
      // ⚠️ Lỗi kinh điển của @unique: Nếu AI vô tình sinh ra Name đã có trong DB, Prisma sẽ crash.
      // Xử lý bằng cách nếu bị trùng Name thì không create nữa, mà dùng luôn bản ghi đang có.
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        this.logger.warn(`[Prisma] Trùng lặp trường Unique cho "${query}". Lấy bản ghi có sẵn.`);
        return await this.prisma.foodLibrary.findUnique({
          where: { name: query }
        });
      }

      this.logger.error(`[AI] Gặp lỗi: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}