import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../services/api'

export default function Analytics() {
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary('week'),
  })

  return (
    <div>
      <h1>Progress Analytics</h1>
      
      <div className="card">
        <h3>Weekly Summary</h3>
        {summary ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <p><strong>Average Calories:</strong> {summary.averageCalories} kcal/day</p>
              <p><strong>Average Protein:</strong> {summary.averageProtein}g/day</p>
              <p><strong>Average Carbs:</strong> {summary.averageCarbs}g/day</p>
              <p><strong>Average Fat:</strong> {summary.averageFat}g/day</p>
            </div>
            <div>
              <p><strong>Weight Change:</strong> {summary.weightChange}kg</p>
              <p><strong>Adherence Rate:</strong> {summary.adherenceRate}%</p>
              <p><strong>Days Tracked:</strong> {summary.dataPoints}/7</p>
            </div>
          </div>
        ) : (
          <p>Loading analytics...</p>
        )}
      </div>
    </div>
  )
}
