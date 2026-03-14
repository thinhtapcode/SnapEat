import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TdeeService } from './tdee.service';

@Injectable()
export class TdeeListener {

  private readonly logger = new Logger(TdeeListener.name);

  constructor(private readonly tdeeService: TdeeService) {}

  /**
   * Lắng nghe sự kiện 'user.profile.updated' từ User Service
   * Payload chứa thông tin userId và các chỉ số sinh học mới
   */
  @OnEvent('user.profile.updated')
  async handleUserProfileUpdatedEvent(payload: { userId: string }) {
    this.logger.log(`[Replication] Đang xử lý đồng bộ dữ liệu TDEE cho User: ${payload.userId}`);
    
    try {
      // Khi User cập nhật Profile, chúng ta thực hiện tính toán lại ngay lập tức
      // để dữ liệu bản sao (hoặc cache) luôn mới nhất.
      await this.tdeeService.calculateForUser(payload.userId);
      
      this.logger.log(`[Replication] Hoàn tất cập nhật chỉ số cho User: ${payload.userId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Replication] Lỗi khi đồng bộ dữ liệu TDEE: ${message}`);
    }
  }
}