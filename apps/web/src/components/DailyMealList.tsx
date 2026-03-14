import React from 'react';

interface Meal {
  id: string;
  name: string;
  type: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface DailyMealListProps {
  meals: Meal[] | undefined;
  isLoading?: boolean;
}

// Trong file DailyMealList.tsx
export const DailyMealList = ({ meals, isLoading, onDelete, onEdit }: any) => {
  if (isLoading) return <p>Đang tải...</p>;
  const sortedMeals = meals ? [...meals].reverse() : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sortedMeals?.map((meal: any) => (
        <div key={meal.id} style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '15px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' 
        }}>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>{meal.name}</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
              {meal.totalCalories} kcal | P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFat}g
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onEdit(meal)}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #2196F3', color: '#2196F3', background: 'none', cursor: 'pointer' }}
            >
              Sửa
            </button>
            <button 
              onClick={() => onDelete(meal.id)}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #f44336', color: '#f44336', background: 'none', cursor: 'pointer' }}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};