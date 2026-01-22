import { useQuery } from '@tanstack/react-query'
import { mealApi, tdeeApi } from '../services/api'

export default function Dashboard() {
  const { data: dailySummary } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: () => mealApi.getDailySummary(),
  })

  const { data: tdee } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  })

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Today's Calories</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
            {dailySummary?.summary.totalCalories.toFixed(0) || 0}
          </p>
          <p>
            {tdee?.recommendedCalories && `Goal: ${tdee.recommendedCalories} kcal`}
          </p>
        </div>

        <div className="card">
          <h3>Protein</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
            {dailySummary?.summary.totalProtein.toFixed(1) || 0}g
          </p>
          <p>
            {tdee?.macros?.protein && `Goal: ${tdee.macros.protein}g`}
          </p>
        </div>

        <div className="card">
          <h3>Carbs</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
            {dailySummary?.summary.totalCarbs.toFixed(1) || 0}g
          </p>
          <p>
            {tdee?.macros?.carbs && `Goal: ${tdee.macros.carbs}g`}
          </p>
        </div>

        <div className="card">
          <h3>Fat</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>
            {dailySummary?.summary.totalFat.toFixed(1) || 0}g
          </p>
          <p>
            {tdee?.macros?.fat && `Goal: ${tdee.macros.fat}g`}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Recent Meals</h3>
        {dailySummary?.meals && dailySummary.meals.length > 0 ? (
          <div>
            {dailySummary.meals.map((meal: any) => (
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
    </div>
  )
}
