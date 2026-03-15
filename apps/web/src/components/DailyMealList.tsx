import React from 'react';

export const DailyMealList = ({ meals, isLoading, onDelete, onEdit }: any) => {
  if (isLoading) return <p style={{ textAlign: 'center', color: '#666' }}>Đang tải...</p>;

  const sortedMeals = meals ? [...meals].reverse() : [];
  const hasMeals = sortedMeals.length > 0;

  return (
    <div style={{
      padding: '20px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.4)', // Glassmorphism nhẹ
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
      minHeight: '150px', // Đảm bảo khung không quá bé khi trống
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {hasMeals ? (
        sortedMeals.map((meal: any) => (
          <div key={meal.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '15px', 
            background: 'rgba(255, 255, 255, 0.8)', // Nền item trắng hơn để nổi bật
            borderRadius: '12px', 
            border: '1px solid rgba(238, 238, 238, 0.5)',
            transition: 'transform 0.2s'
          }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: '#333' }}>{meal.name}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                <span style={{ color: '#00A389', fontWeight: 600 }}>{meal.totalCalories} kcal</span> 
                <span style={{ marginLeft: '10px', color: '#888' }}>
                  P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFat}g
                </span>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => onEdit(meal)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #2196F3', color: '#2196F3', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Sửa
              </button>
              <button 
                onClick={() => onDelete(meal.id)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f44336', color: '#f44336', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))
      ) : (
        /* Trạng thái trống (Empty State) */
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1, 
          padding: '40px 0',
          color: '#888' 
        }}>
          <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🍽️</span>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>Chưa có món ăn nào được ghi lại</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#aaa' }}>Hãy thêm bữa ăn đầu tiên của bạn!</p>
        </div>
      )}
    </div>
  );
};