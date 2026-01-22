export default function MealLog() {
  return (
    <div>
      <h1>Meal Logging</h1>
      <div className="card">
        <h3>Log a New Meal</h3>
        <p>Manual meal logging and photo recognition will be implemented here.</p>
        <button className="primary">Add Manual Meal</button>
        <button className="secondary" style={{ marginLeft: '10px' }}>Scan Food Photo</button>
      </div>
    </div>
  )
}
