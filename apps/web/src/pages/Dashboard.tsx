import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; // CSS mặc định của thư viện
import { useQuery } from '@tanstack/react-query'
import { mealApi, tdeeApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { DailyMealList } from '../components/DailyMealList';

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: dailySummary } = useQuery({
  queryKey: ['dailySummary', new Date().toISOString().split('T')[0]], // Key theo ngày
  queryFn: () => mealApi.getDailySummary(new Date().toISOString().split('T')[0]),
});

  const { data: tdee } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  })
  const goalData = tdee?.current || tdee?.recommend;
  const calculatePercentage = (current: number, goal: number): number => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100); // Đảm bảo không vượt quá 100%
  };

  const getFormattedDate = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" }); // Tên ngày
    const monthName = today.toLocaleDateString("en-US", { month: "long" }); // Tên tháng
    const day = today.getDate(); // Ngày
    const year = today.getFullYear(); // Năm
    return `${dayName}, ${monthName} ${day}, ${year}`;
  };

  return (
    <div>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          background: "#ffffff",
          borderRadius: "8px",
          marginBottom: "10px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Đổ bóng
        }}
      >
        {/* Avatar và lời chào */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src="../src/assets/images/avatar.svg" // Avatar hoặc ảnh người dùng
            alt="User Avatar"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h2 style={{ margin: "0", fontSize: "1.5rem" }}>{getFormattedDate()}</h2>
            <p style={{ margin: "0", color: "#666" }}>
              Good morning, {user?.username}, have a great day!
            </p>
            <p style={{ margin: "0", color: "#aaa", fontStyle: "italic" }}>
              "quote of date"
            </p>
          </div>
        </div>

        {/* Streak */}
        <div
  style={{
    display: "flex", // Sử dụng Flexbox để bố trí icon và chữ
    alignItems: "center",
    gap: "0.5rem", // Khoảng cách giữa icon và phần chữ
    background: "#ffe9d6", // Nền vàng nhạt
    padding: "0.5rem 1rem", // Khoảng cách trong khung
    borderRadius: "20px", 
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)", // Đổ bóng nhẹ
  }}
>
  {/* Icon (bên trái) */}
  <img
    src="../src/assets/images/streak1.svg" // Đường dẫn icon ngọn lửa
    alt="Streak Icon"
    style={{
      width: "50px", // Kích thước icon lớn hơn để cân đối
      height: "50px",
    }}
  />
  
  {/* Phần chữ (bên phải) */}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <span
      style={{
        fontWeight: "bold",
        fontSize: "1.5rem", // Kích thước lớn cho số ngày
        color: "#ff6f00", // Màu sắc nổi bật
      }}
    >
      {user?.currentStreak || 0} {/* Đây là số ngày streak */}
    </span>
    <span
      style={{
        fontSize: "1rem", // Kích thước nhỏ hơn cho chữ "day streak"
        color: "#ff6f00", // Màu xám nhạt
      }}
    >
      day streak!
    </span>
  </div>
</div>
      </div>
      
       <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 3fr", // Cột trái (Total Calories) và cột phải (4 ô khác)
          gap: "20px",
          height: "calc(100vh - 180px)", // Đặt chiều cao cố định để hiển thị vừa trang
        }}
      >
        {/* Total Calories */}
        <div
          className="card"
          style={{
            gridRow: "span 2", // Chiếm toàn bộ chiều cao cột trái
            textAlign: "center",
            padding: "1.5rem",
            background: "#eafaf1",
            border: "1px solid #4CAF50",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "495px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Đổ bóng
          }}
        >
          <h3 style={{ fontSize: '1.5rem', color: '#4CAF50' }}>Total Calories</h3>
          <div style={{ width: '150px', height: '150px', margin: '1rem auto' }}>
            <CircularProgressbar
              value={calculatePercentage(
                dailySummary?.summary.totalCalories || 0,
                goalData?.calories || 1
              )}
              text={`${calculatePercentage(
                dailySummary?.summary.totalCalories || 0,
                goalData?.calories || 1
              ).toFixed(0)}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: '#4CAF50',
                textColor: '#4CAF50',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
            {dailySummary?.summary.totalCalories.toFixed(0) || 0} kcal
          </p>
          <p style={{ color: '#666' }}>
            {goalData?.calories && `Goal: ${goalData.calories} kcal`}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", // 2 ô mỗi hàng
            gridTemplateRows: "1fr 1fr", // 2 hàng có chiều cao bằng nhau
            rowGap: "0px", // Thu hẹp khoảng cách giữa các hàng
            columnGap: "20px", // Khoảng cách giữa các cột giữ nguyên
            
          }}
        >
          <div className="card" style={{ textAlign: 'center', boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <h3>Water</h3>
          <div style={{ width: 120, height: 120, margin: '0 auto' }}>
            <CircularProgressbar
              value={calculatePercentage(
                dailySummary?.summary.totalCalories || 0,
                goalData?.calories || 1
              )}
              text={`${calculatePercentage(
                dailySummary?.summary.totalCalories || 0,
                goalData?.calories || 1
              ).toFixed(0)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#009dff',
                textColor: '#009dff',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#009dff' }}>
            {dailySummary?.summary.totalCalories.toFixed(0) || 0} kcal
          </p>
          <p>
            {goalData?.calories && `Goal: ${goalData.calories} kcal`}
          </p>
        </div>
              {/* Protein */}
        <div className="card" style={{ textAlign: 'center',boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"}}>
          <h3>Protein</h3>
          <div style={{ width: 120, height: 120, margin: '0 auto' }}>
            <CircularProgressbar
              value={calculatePercentage(
                dailySummary?.summary.totalProtein || 0,
                goalData?.macros?.protein || 1
              )}
              text={`${calculatePercentage(
                dailySummary?.summary.totalProtein || 0,
                goalData?.macros?.protein || 1
              ).toFixed(0)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#ff62c0',
                textColor: '#ff62c0',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff62c0' }}>
            {dailySummary?.summary.totalProtein.toFixed(1) || 0}g
          </p>
          <p>
            {goalData?.macros?.protein && `Goal: ${goalData.macros.protein}g`}
          </p>
        </div>

        {/* Carbs */}
        <div className="card" style={{ textAlign: 'center',boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <h3>Carbs</h3>
          <div style={{ width: 120, height: 120, margin: '0 auto' }}>
            <CircularProgressbar
              value={calculatePercentage(
                dailySummary?.summary.totalCarbs || 0,
                goalData?.macros?.carbs || 1
              )}
              text={`${calculatePercentage(
                dailySummary?.summary.totalCarbs || 0,
                goalData?.macros?.carbs || 1
              ).toFixed(0)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#FF9800',
                textColor: '#FF9800',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
            {dailySummary?.summary.totalCarbs.toFixed(1) || 0}g
          </p>
          <p>
            {goalData?.macros?.carbs && `Goal: ${goalData.macros.carbs}g`}
          </p>
        </div>

        {/* Fat */}
        <div className="card" style={{ textAlign: 'center',boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"}}>
          <h3>Fat</h3>
          <div style={{ width: 120, height: 120, margin: '0 auto' }}>
            <CircularProgressbar
              value={calculatePercentage(
                dailySummary?.summary.totalFat || 0,
                goalData?.macros?.fat || 1
              )}
              text={`${calculatePercentage(
                dailySummary?.summary.totalFat || 0,
                goalData?.macros?.fat || 1
              ).toFixed(0)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#f44336',
                textColor: '#f44336',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>
            {dailySummary?.summary.totalFat.toFixed(1) || 0}g
          </p>
          <p>
            {goalData?.macros?.fat && `Goal: ${goalData.macros.fat}g`}
          </p>
        </div>
        </div>
        

         
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
      <DailyMealList meals={dailySummary?.meals} />
    </div>
    </div>
  )
}
