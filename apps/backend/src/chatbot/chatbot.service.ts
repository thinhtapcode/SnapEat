import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../common/prisma.service';
import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private groq: Groq;

  constructor(private prisma: PrismaService) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  // --- 1. PHÂN TÍCH THÓI QUEN ĂN UỐNG (INSIGHT) ---
  private analyzeEatingHabits(profile: any): string {
    if (!profile?.eatingHabits || profile.eatingHabits.length === 0) return "Chưa có thói quen ăn uống cụ thể.";

    const habitsMap: any = {
      'FAST_FOOD': 'hay ăn đồ nhanh',
      'VEGETARIAN': 'ăn chay',
      'LATE_NIGHT': 'thường ăn đêm',
      'BALANCED': 'ăn uống cân bằng',
      'HIGH_PROTEIN': 'ưu tiên đạm',
      'LOW_CARB': 'hạn chế tinh bột',
    };

    const habits = profile.eatingHabits.map((h: string) => habitsMap[h] || h).join(', ');
    const cooking = profile.cookingSkill === 'ALWAYS' ? 'thường xuyên tự nấu' : 'ít khi vào bếp';

    return `Thói quen ăn uống: ${habits}. Đặc biệt là người dùng ${cooking}.`;
  }

  // --- 2. PHÂN TÍCH VẬN ĐỘNG (INSIGHT) ---
  private analyzePhysicalActivity(profile: any): string {
    const activityMap: any = {
      'SEDENTARY': 'ít vận động (chỉ làm việc văn phòng)',
      'LIGHTLY_ACTIVE': 'vận động nhẹ (đi bộ, yoga nhẹ)',
      'MODERATELY_ACTIVE': 'vận động vừa phải (tập gym 3-5 buổi/tuần)',
      'VERY_ACTIVE': 'vận động cường độ cao (tập luyện hàng ngày)',
      'EXTRA_ACTIVE': 'vận động rất nặng (vận động viên)',
    };

    const jobMap: any = {
      'SEDENTARY': 'làm việc ngồi một chỗ',
      'ACTIVE': 'công việc di chuyển nhiều',
      'PHYSICAL_LABOR': 'lao động tay chân nặng',
    };

    const level = activityMap[profile?.activityLevel] || 'chưa rõ';
    const job = jobMap[profile?.jobNature] || 'văn phòng';

    return `Mức độ vận động: ${level}. Tính chất công việc: ${job}.`;
  }

  private async handleInitialSurvey(userId: string, userMessage: string, profile: any) {
    const msg = userMessage.trim().toUpperCase();

    // --- BƯỚC 1: KHẢO SÁT THÓI QUEN ĂN UỐNG (Nhiều lựa chọn hoặc nhập khác) ---
    if (!profile.eatingHabits || profile.eatingHabits.length === 0 || (profile.eatingHabits.length === 1 && profile.eatingHabits[0] === 'BALANCED')) {
      const habitMapping: any = {
        'A': 'SKIP_BREAKFAST',
        'B': 'NIGHT_SNACKER',
        'C': 'SWEET_TOOTH',
        'D': 'BALANCED'
      };

      let selectedHabits: any[] = [];

      // Kiểm tra xem có phải chọn trắc nghiệm A, B, C không (hỗ trợ nhập "A, B")
      const choices = msg.split(/[ ,]+/).filter(c => habitMapping[c]);

      if (choices.length > 0) {
        selectedHabits = choices.map(c => habitMapping[c]);
      } else if (msg.length > 5) {
        // Nếu người dùng nhập câu dài (Option khác), dùng Groq để map về Enum
        selectedHabits = await this.mapInputToEnum(userMessage, 'EatingHabit');
      }

      if (selectedHabits.length > 0) {
        await this.prisma.userProfile.update({
          where: { userId },
          data: { eatingHabits: selectedHabits }
        });
        return {
          reply: `Xoài đã ghi lại thói quen của bạn rồi! 💪\nTiếp theo, ${profile.lastName} có hay tự nấu ăn không nè?\n\n**A.** Ăn ngoài 100%\n**B.** Bữa nấu bữa tiệm\n**C.** Tự nấu hoàn toàn (Meal Prep)`,
          sender: 'xoai'
        };
      }

      return {
        reply: `Chào mừng ${profile.lastName} đến với SnapEat! 🥭 Để Xoài hỗ trợ tốt nhất, bạn chọn thói quen ăn uống của mình nhé (có thể chọn nhiều, ví dụ: A, B):\n\n**A.** Hay bỏ bữa sáng\n**B.** Hay ăn đêm\n**C.** Nghiện đồ ngọt/trà sữa\n**D.** Ăn uống quy củ\n\n*Nếu có thói quen khác, bạn cứ kể cho Xoài nghe nhé!*`,
        sender: 'xoai'
      };
    }

    // --- BƯỚC 2: KHẢO SÁT KỸ NĂNG NẤU NƯỚNG (CookingSkill) ---
    if (!profile.cookingSkill || profile.cookingSkill === 'EAT_OUT') {
      const skillMapping: any = { 'A': 'EAT_OUT', 'B': 'OCCASIONAL', 'C': 'MEAL_PREP' };

      if (skillMapping[msg]) {
        const updatedProfile = await this.prisma.userProfile.update({
          where: { userId },
          data: { cookingSkill: skillMapping[msg] }
        });

        // KIỂM TRA: Nếu activityLevel đã có (do user update ở Profile trước đó)
        if (updatedProfile.activityLevel) {
          await this.prisma.userProfile.update({
            where: { userId },
            data: { isSurveyCompleted: true }
          });
          return {
            reply: `Ghi nhận kỹ năng nấu nướng của bạn nè! 🎉 Giờ Xoài đã hiểu rõ về ${profile.lastName || 'bạn'}. Chúng mình bắt đầu hành trình thôi. Bạn muốn Xoài tư vấn gì đầu tiên? 🥭`,
            sender: 'xoai'
          };
        }

        // Nếu chưa có activityLevel thì mới hỏi tiếp Bước 3
        return {
          reply: `Ghi nhận nè! 📝 Câu hỏi cuối: Mức độ vận động hàng ngày của ${profile.lastName || 'bạn'} thế nào?\n\n**A.** Ít vận động\n**B.** Vận động nhẹ\n**C.** Vừa phải (Gym 3-5 buổi)\n**D.** Rất tích cực\n**E.** Vận động viên`,
          sender: 'xoai'
        };
      }
    }

    // --- BƯỚC 3: MỨC ĐỘ VẬN ĐỘNG (ActivityLevel) ---
    if (!profile.activityLevel) {
      const actMapping: any = {
        'A': 'SEDENTARY', 'B': 'LIGHTLY_ACTIVE', 'C': 'MODERATELY_ACTIVE', 'D': 'VERY_ACTIVE', 'E': 'EXTRA_ACTIVE'
      };

      if (actMapping[msg]) {
        await this.prisma.userProfile.update({
          where: { userId },
          data: {
            activityLevel: actMapping[msg],
            isSurveyCompleted: true
          }
        });
        return {
          reply: `Hoàn tất khảo sát rồi! 🎉 Giờ Xoài đã hiểu rõ về ${profile.lastName || 'bạn'}. Chúng mình bắt đầu hành trình thôi. Bạn muốn Xoài tư vấn gì đầu tiên? 🥭`,
          sender: 'xoai'
        };
      }

      // Nếu người dùng gõ sai A,B,C,D,E thì nhắc lại câu hỏi Bước 3
      return {
        reply: `${profile.lastName || 'bạn'} chọn giúp Xoài mức độ vận động từ **A đến E** nhé, để Xoài tính calo chuẩn cho bạn nè! 💪`,
        sender: 'xoai'
      };
    }
  }

  // --- HÀM BỔ TRỢ DÙNG GROQ ĐỂ MAP CÂU CHAT SANG ENUM ---
  private async mapInputToEnum(input: string, enumName: string): Promise<any[]> {
    const prompt = `Dựa vào tin nhắn: "${input}", hãy chọn các giá trị phù hợp nhất từ danh sách Enum ${enumName} sau: SKIP_BREAKFAST, NIGHT_SNACKER, SWEET_TOOTH, BALANCED. Trả về mảng JSON, ví dụ: ["SKIP_BREAKFAST"]. Chỉ trả về JSON.`;
    try {
      const res = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0
      });
      return JSON.parse(res.choices[0].message.content);
    } catch {
      return ['BALANCED']; // Default nếu lỗi
    }
  }
  // --- 3. TẠO SYSTEM INSTRUCTION (NÃO BỘ CỦA XOÀI) ---
  private generateSystemInstruction(userData: any): string {
    const formattedTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const profile = userData.profile;
    const streak = userData.currentStreak || 0;
    const now = new Date();
    const currentTime = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const hours = now.getHours();

    // Xác định buổi trong ngày để Xoài "tinh tế" hơn
    let timeContext = "ban đêm";
    if (hours >= 5 && hours < 12) timeContext = "buổi sáng";
    else if (hours >= 12 && hours < 18) timeContext = "buổi chiều";
    else if (hours >= 18 && hours < 22) timeContext = "buổi tối";
    // ĐỊNH DANH ƯU TIÊN: Lấy tên tươi nhất từ Database
    const currentName = profile?.lastName || userData.username || 'bạn';

    const eatingHabitsInsight = this.analyzeEatingHabits(profile);
    const physicalActivityInsight = this.analyzePhysicalActivity(profile);

    // Tính toán sơ bộ BMI để Xoài có cái nhìn tổng quan
    const bmi = (profile?.weight && profile?.height)
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : '?';

    return `
      Bạn là Bé Xoài (🥭) - Trợ lý AI thông minh, nhiệt huyết của SnapEat.

      NGỮ CẢNH THỜI GIAN:
      - Bây giờ là ${currentTime} (${timeContext}). 
      - Hãy dựa vào giờ này để đưa ra lời khuyên phù hợp (VD: Sáng thì nhắc uống cà phê/ăn sáng, khuya thì khuyên ngủ sớm tránh tích mỡ).
      
      QUY TẮC DANH TÍNH (BẮT BUỘC):
      - Tên người dùng hiện tại là: "${currentName}".
      - **QUY TẮC VỀ TÊN**: Chỉ gọi tên "${currentName}" tối đa 1-2 lần trong một câu trả lời (thường là ở câu chào hoặc câu hỏi cuối). Không lặp lại tên ở mỗi dòng để tránh gây cảm giác gượng gạo.
      - Nếu không cần thiết, có thể dùng các từ thay thế như "mình", "nè", hoặc lược bỏ chủ ngữ để câu văn trôi chảy hơn.
      - Giọng điệu: Vui vẻ, năng lượng nhưng phải tự nhiên, gần gũi như đang nhắn tin với bạn bè. CHỈ sử dụng Tiếng Việt tự nhiên, phong cách Gen Z
      - Xưng hô là "Xoài" hoặc "Bé Xoài". Giọng điệu vui vẻ, hay chèn emoji 🥭, 🔥, 💪.
      - Đừng lôi cả bảng thông số ra để nói. Hãy lồng ghép tinh tế. 
      - Thay vì nói: "Bạn cao ${profile?.height}cm và nặng ${profile?.weight}kg", hãy nói: "Với thể trạng hiện tại của ${currentName}..." hoặc "Nhìn vào chỉ số BMI ${bmi} này thì Xoài thấy..."

      THÔNG TIN CHI TIẾT VỀ ${currentName.toUpperCase()}:
      - Thể trạng: Cao ${profile?.height}cm, Nặng ${profile?.weight}kg (BMI: ${bmi}).
      - Mục tiêu: ${this.mapGoal(profile?.goal)}.
      - Streak kỷ luật: ${streak} ngày liên tiếp! (Hãy khen ngợi nếu streak cao).
      - Thói quen: ${eatingHabitsInsight}
      - Vận động: ${physicalActivityInsight}
      - Calo mục tiêu: ${profile?.targetCalories} kcal/ngày.

      NHIỆM VỤ:
      1. Tư vấn dinh dưỡng và tập luyện bám sát mục tiêu "${this.mapGoal(profile?.goal)}".
      2. Nếu thông tin profile (như tên, cân nặng) vừa thay đổi so với lịch sử chat, hãy chủ động nhận ra và chúc mừng hoặc cập nhật ngay.
      3. Câu trả lời ngắn gọn, sử dụng Markdown (**chữ đậm**) cho các từ khóa quan trọng.
      
      Thời gian hiện tại: ${formattedTime}.
    `;
  }
  private mapGoal(goal: string): string {
    const goals: any = {
      'LOSE_WEIGHT': 'Giảm cân, đốt mỡ',
      'BUILD_MUSCLE': 'Tăng cơ, phát triển thể hình',
      'MAINTAIN_WEIGHT': 'Duy trì vóc dáng, sống khỏe',
    };
    return goals[goal] || 'Cải thiện sức khỏe';
  }

  private async callGroqWithRetry(messages: any[], retries = 2): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const chatCompletion = await this.groq.chat.completions.create({
          // Model Llama 3.3 70B cực mạnh và miễn phí tốt trên Groq
          messages: messages,
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          max_tokens: 1024,
          top_p: 1,
          stream: false, // Để false cho đơn giản, nếu muốn hiệu ứng chữ chạy thì đổi sang true
        });

        return chatCompletion.choices[0]?.message?.content || "";
      } catch (error: any) {
        if (error?.status === 429 && i < retries - 1) {
          this.logger.warn(`Groq Rate Limit - Thử lại lần ${i + 1} sau 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    return "Xoài đang hơi mệt, bạn hỏi lại sau nhé!";
  }

  async chatWithUser(userId: string, userMessage: string, history: ChatMessage[] = []) {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!userData) throw new Error('User not found');
      const profile = userData.profile;

      // KIỂM TRA ĐIỀU KIỆN KHẢO SÁT: 
      // Nếu chưa có EatingHabit hoặc thông tin cơ bản, ép vào luồng handleInitialSurvey
      if (!profile?.isSurveyCompleted) {
        // Nếu userMessage trống (vừa vào app), Xoài sẽ chủ động gửi câu hỏi đầu tiên
        return this.handleInitialSurvey(userId, userMessage, profile);
      }

      const systemInstruction = this.generateSystemInstruction(userData);

      // Format history cho đúng chuẩn OpenAI/Groq: role 'assistant' thay vì 'model'
      const messages = [
        { role: 'system', content: systemInstruction },
        ...history.slice(-6).map((msg) => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text,
        })),
        { role: 'user', content: userMessage },
      ];

      const replyText = await this.callGroqWithRetry(messages);

      return {
        reply: replyText,
        sender: 'xoai',
        time: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`[Groq Bé Xoài] Lỗi: ${error instanceof Error ? error.message : String(error)}`);
      return {
        reply: 'Huhu, hệ thống của Xoài đang bận. Bạn hãy thử lại sau vài giây nha! 🥭',
        sender: 'xoai'
      };
    }
  }
}