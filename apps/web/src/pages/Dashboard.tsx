import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useQuery } from '@tanstack/react-query';
import { mealApi, tdeeApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { DailyMealList } from '../components/DailyMealList';
import { QUOTES } from '../assets/data/quotes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import QuickMealModal from '../components/QuickEditModal';
// Thêm icon và dayjs
import { Flame, Target, Zap, Clock3 } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';
import avatarSvg from '../assets/images/avatar.svg';
import streak1Svg from '../assets/images/streak1.svg';
import streak2Svg from '../assets/images/streak2.svg';
import { notify } from '../utils/notifier';

// Kích hoạt plugin dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi'); // Thiết lập tiếng Việt

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const [now, setNow] = useState(dayjs().tz('Asia/Ho_Chi_Minh'));

  // Đồng hồ thời gian thực (Real-time Clock)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs().tz('Asia/Ho_Chi_Minh'));
    }, 1000);
    return () => clearInterval(timer); // Clear bộ nhớ khi đóng trang
  }, []);

  // Lấy ngày YYYY-MM-DD địa phương để gọi API chuẩn múi giờ
  const today = now.format('YYYY-MM-DD');

  const { data: dailySummary } = useQuery({
    queryKey: ['dailySummary', today],
    queryFn: () => mealApi.getDailySummary(today),
  });

  const { data: tdee } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  });

  const goalData = tdee?.current || tdee?.recommend;

  // --- LOGIC TÍNH TOÁN % VÀ KIỂM TRA MỤC TIÊU ---
  const currentCal = dailySummary?.summary.totalCalories || 0;
  const targetCal = goalData?.calories || 0;

  const isWithinStreakZone = targetCal > 0 && currentCal >= targetCal * 0.9 && currentCal <= targetCal * 1.1;
  const isOverLimit = targetCal > 0 && currentCal > targetCal * 1.1;

  const calculatePercentage = (current: number, goal: number): number => {
    if (!goal || goal === 0) return 0;
    const percent = (current / goal) * 100;
    return percent;
  };

  // --- LOGIC LỜI CHÀO & ĐỒNG HỒ (Dùng dayjs) ---
  const formattedDate = now.format('ddd, DD/MM/YYYY');
  const formattedTime = now.format('HH:mm:ss');

  const getGreeting = () => {
    const hour = now.hour();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };
  const getDisplayName = () => {
    // 1. Kiểm tra xem authUser có tồn tại không
    if (!authUser) return 'Bạn';

    // 2. Ưu tiên lấy từ profile (Nếu backend trả về lồng trong profile)
    const profile = tdee?.profile || authUser?.profile;
    const first = profile?.firstName || '';
    const last = profile?.lastName || '';
    const fullName = `${first} ${last}`.trim();


    return fullName || authUser.username || 'Bạn';
  };
  const getQuoteOfDay = () => {
    const dateSeed = now.format('YYYYMMDD'); // Ví dụ: "20260314"
    const index = parseInt(dateSeed) % QUOTES.length;
    return QUOTES[index];
  };

  const dailyQuote = getQuoteOfDay();
  // 1. Logic Xóa nhanh
  const deleteMutation = useMutation({
    mutationFn: (mealId: string) => mealApi.delete(mealId),
    onSuccess: () => {
      // Refresh lại dữ liệu Dashboard ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['dailySummary', today] });
      notify.success('Đã xóa bữa ăn!');
    },
  });

  const handleDeleteMeal = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này không?')) {
      deleteMutation.mutate(id);
    }
  };
  const updateMealMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mealApi.update(id, data),
    onSuccess: () => {
      // Refresh lại dữ liệu Dashboard và MealLog
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      queryClient.invalidateQueries({ queryKey: ['meals'] });

      setEditingMeal(null); // Đóng modal
      notify.success('Cập nhật bữa ăn thành công! ✨');
    },
    onError: (error: any) => {
      notify.error(`Lỗi khi cập nhật: ${error.response?.data?.message || error.message}`);
    }
  });

  // 2. Logic Sửa nhanh (Mở Modal)
  const [editingMeal, setEditingMeal] = useState<any>(null);

  return (
    <div style={{ position: 'relative', padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2px' }}></div>
      {/* 1. THÔNG BÁO TRẠNG THÁI (BANNER) */}
      {isOverLimit && (
        <StatusBanner type="error">
          ⚠️ Cảnh báo: Bạn đã vượt quá lượng Calo cần thiết! Hãy dừng nạp thêm.
        </StatusBanner>
      )}

      {isWithinStreakZone && (
        <StatusBanner type="success">
          🎉 Tuyệt vời! Bạn đã đạt mục tiêu hôm nay. Chuỗi Streak đã được ghi nhận!
        </StatusBanner>
      )}

      {/* Header Section - Đã Responsive hóa */}
      <div style={{
        display: "flex",
        flexDirection: "column", // Luôn ưu tiên xếp dọc trên Mobile cho thoáng
        padding: "1.5rem",
        background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
        color: 'white',
        borderRadius: "24px",
        marginBottom: "25px",
        gap: "1.5rem"
      }}>

        {/* Dòng 1: Thời gian - Chống xuống hàng tuyệt đối */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.15)',
          padding: '8px 12px',
          borderRadius: '15px',
          width: '100%',
          gap: '10px',
          color: '#475569',
          overflow: 'hidden' // Đảm bảo không có gì tràn ra ngoài
        }}>
          {/* Phần Ngày Tháng - Dùng whiteSpace: 'nowrap' để ép nằm 1 hàng */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', // Font tự co giãn theo màn hình
            whiteSpace: 'nowrap',
            flexShrink: 1, // Ưu tiên co lại nếu thiếu chỗ
            overflow: 'hidden',
            color: '#475569',
            textOverflow: 'ellipsis' // Nếu quá dài sẽ hiện dấu ... thay vì xuống dòng
          }}>
            <Clock3 size={14} />
            <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{formattedDate}</span>
          </div>

          {/* Thanh ngăn cách và Giờ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#475569',
            flexShrink: 0 // Giờ phải luôn hiện rõ, không được phép co
          }}>
            <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
            <span style={{
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: 'clamp(0.8rem, 3vw, 1rem)', // Giờ cũng tự co giãn nhẹ
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Dòng 2: Avatar & Chào hỏi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <img src={avatarSvg}
            alt="Avatar"
            style={{ width: "55px", height: "55px", borderRadius: "50%", border: '2px solid rgba(255,255,255,0.3)' }} />
          <h1 style={{ margin: "0", fontSize: "1.6rem", fontWeight: '800', color: '#0f172a', flex: 1 }}>
            {getGreeting()}, {getDisplayName()}!
          </h1>
        </div>

        {/* Dòng 3: Quote - Bung lụa chiều ngang */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          borderLeft: '4px solid #fbbf24',
          width: '100%'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#475569', lineHeight: '1.5' }}>
            "{dailyQuote.text}"
          </p>
          <p style={{ margin: '5px 0 0', fontSize: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
            — {dailyQuote.author}
          </p>
        </div>

        {/* Dòng 4: Streak - Gọn gàng phía dưới */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: isWithinStreakZone ? "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)" : "rgba(111, 111, 111, 0.7)",
          padding: "10px 20px", borderRadius: "18px",
          width: "fit-content"
        }}>
          <img src={isWithinStreakZone ? streak1Svg : streak2Svg} alt="Streak" style={{ width: "30px" }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontWeight: "800", fontSize: "1.4rem", color: isWithinStreakZone ? "#d97706" : "#fff" }}>
              {dailySummary?.streak?.current || 0}
            </span>
            <span style={{ fontSize: "0.7rem", fontWeight: 'bold', opacity: 0.9, color: isWithinStreakZone ? "#d97706" : "#fff" }}>
              NGÀY CHUỖI
            </span>
          </div>
        </div>
      </div>


      {/* 3. DASHBOARD GRID - Nâng cấp Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px", marginBottom: "30px" }}>

        {/* Calo Card - Nâng cấp màu sắc và icon */}
        <div className="card" style={{
          textAlign: 'center', padding: '2rem', borderRadius: '25px', backgroundColor: '#fff',
          boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
          border: isWithinStreakZone ? '2px solid #4CAF50' : isOverLimit ? '2px solid #f44336' : 'none',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '20px' }}>
            <Flame size={20} color={isWithinStreakZone ? '#4CAF50' : '#d65bff'} />
            <h3 style={{ fontSize: '1.1rem', color: '#333', margin: 0 }}>Năng lượng</h3>
          </div>

          <div style={{ width: '130px', height: '130px', margin: '0 auto' }}>
            <CircularProgressbar
              value={calculatePercentage(currentCal, targetCal)}
              text={`${Math.round(calculatePercentage(currentCal, targetCal))}%`}
              styles={buildStyles({
                pathColor: isOverLimit ? '#f44336' : isWithinStreakZone ? '#4CAF50' : '#d65bff',
                textColor: isOverLimit ? '#f44336' : isWithinStreakZone ? '#4CAF50' : '#d65bff',
                trailColor: '#f0f0f0',
                textSize: '1.8rem'
              })}
            />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#333', margin: '20px 0 5px' }}>
            {currentCal.toFixed(0)} <small style={{ fontSize: '0.9rem' }}>kcal</small>
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#999', background: '#f8f8f8', padding: '6px 15px', borderRadius: '15px' }}>
            <Target size={14} />
            Mục tiêu: <strong>{targetCal} kcal</strong>
          </div>
        </div>

        {/* Macro Cards - Nâng cấp màu sắc chuẩn hơn */}
        <MacroCard label="Protein" icon={<Zap size={20} />} current={dailySummary?.summary.totalProtein} goal={goalData?.macros?.protein} color="#2196F3" />
        <MacroCard label="Carbs" icon={<Zap size={20} />} current={dailySummary?.summary.totalCarbs} goal={goalData?.macros?.carbs} color="#FF9800" />
        <MacroCard label="Chất béo" icon={<Zap size={20} />} current={dailySummary?.summary.totalFat} goal={goalData?.macros?.fat} color="#f44336" />
      </div>

      <div className="card" style={{ borderRadius: '25px', padding: '25px', backgroundColor: '#fff' }}>
        <h3 style={{ marginBottom: '25px', color: '#333' }}>Nhật ký ăn uống hôm nay</h3>

        {/* Truyền thêm props xử lý vào list */}
        <DailyMealList
          meals={dailySummary?.meals}
          onEdit={(meal: any) => setEditingMeal(meal)} // Mở modal sửa
          onDelete={(id: string) => handleDeleteMeal(id)} // Gọi hàm xóa
        />
      </div>

      {/* Render Modal Sửa ở đây nếu editingMeal != null */}
      {editingMeal && (
        <QuickMealModal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSave={(data) => updateMealMutation.mutate({ id: editingMeal.id, data })}
          isPending={updateMealMutation.isPending}
        />
      )}
      {/* CSS Animation cho cảnh báo */}
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// Component phụ cho Macro để code sạch hơn
function MacroCard({ label, icon, current, goal, color }: any) {
  const percent = ((current || 0) / (goal || 1)) * 100;
  return (
    <div className="card" style={{
      textAlign: 'center', padding: '1.8rem', borderRadius: '25px',
      backgroundColor: '#fff', boxShadow: "0px 10px 30px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '18px' }}>
        <div style={{ color }}>{icon}</div>
        <h3 style={{ fontSize: '1rem', color: '#333', margin: 0 }}>{label}</h3>
      </div>
      <div style={{ width: '100px', height: '100px', margin: '0 auto' }}>
        <CircularProgressbar
          value={percent > 100 ? 100 : percent}
          text={`${Math.round(percent)}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#f0f0f0'
          })}
        />
      </div>
      <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#333', margin: '18px 0 5px' }}>
        {(current || 0).toFixed(1)} <small style={{ fontSize: '0.8rem' }}>g</small>
      </p>
      <small style={{ color: '#999' }}>Mục tiêu: {goal}g</small>
    </div>
  );
}

// Component phụ cho Status Banner
function StatusBanner({ type, children }: { type: 'success' | 'error', children: React.ReactNode }) {
  const isSuccess = type === 'success';
  return (
    <div style={{
      background: isSuccess ? '#e8f5e9' : '#ffeded',
      color: isSuccess ? '#2e7d32' : '#d32f2f',
      padding: '15px', borderRadius: '15px', marginBottom: '20px',
      border: isSuccess ? '1px solid #c8e6c9' : '1px solid #ffcdd2',
      textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem',
      boxShadow: "0px 4px 10px rgba(0,0,0,0.03)",
      animation: !isSuccess ? 'shake 0.5s ease-in-out' : 'none'
    }}>
      {children}
    </div>
  );
}