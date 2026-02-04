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

export const DailyMealList = ({ meals, isLoading }: DailyMealListProps) => {
  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3>Meals Today</h3>
      {isLoading ? (
        <p>Loading meals...</p>
      ) : meals && meals.length > 0 ? (
        <div>
          {meals.map((meal) => (
            <div key={meal.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{meal.name}</strong> - {meal.type}
              <br />
              <small>
                {meal.totalCalories.toFixed(0)} kcal | 
                P: {meal.totalProtein.toFixed(1)}g | 
                C: {meal.totalCarbs.toFixed(1)}g | 
                F: {meal.totalFat.toFixed(1)}g
              </small>
            </div>
          ))}
        </div>
      ) : (
        <p>No meals logged today</p>
      )}
    </div>
  );
};