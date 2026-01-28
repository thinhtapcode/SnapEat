import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { tdeeApi } from '../services/api'

export default function Profile() {
  const { data: tdee, refetch } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'MODERATELY_ACTIVE',
    goal: 'MAINTAIN_WEIGHT',
    calories: '',
    proteinPercentage: '',
  })

  // Calculate protein in grams
  const proteinGrams = useMemo(() => {
    const calories = parseFloat(formData.calories)
    const proteinPct = parseFloat(formData.proteinPercentage)
    
    if (isNaN(calories) || isNaN(proteinPct) || calories <= 0 || proteinPct <= 0 || proteinPct > 100) {
      return null
    }
    
    // Calculate: (calories × protein% / 100) / 4 calories per gram
    const proteinCalories = (calories * proteinPct) / 100
    const grams = proteinCalories / 4
    
    return grams.toFixed(1)
  }, [formData.calories, formData.proteinPercentage])

  const updateProfile = useMutation({
    mutationFn: tdeeApi.updateProfile,
    onSuccess: () => {
      refetch()
      alert('Profile updated successfully!')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submitData: any = {
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
    }
    
    // Add optional fields if they have values
    if (formData.calories) {
      submitData.calories = parseFloat(formData.calories)
    }
    if (formData.proteinPercentage) {
      submitData.proteinPercentage = parseFloat(formData.proteinPercentage)
    }
    
    updateProfile.mutate(submitData)
  }

  return (
    <div>
      <h1>Profile Settings</h1>
      
      <div className="card">
        <h3>Personal Information</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              >
                <option value="SEDENTARY">Sedentary</option>
                <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                <option value="MODERATELY_ACTIVE">Moderately Active</option>
                <option value="VERY_ACTIVE">Very Active</option>
                <option value="EXTRA_ACTIVE">Extra Active</option>
              </select>
            </div>
            <div>
              <label>Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              >
                <option value="LOSE_WEIGHT">Lose Weight</option>
                <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
                <option value="GAIN_WEIGHT">Gain Weight</option>
                <option value="BUILD_MUSCLE">Build Muscle</option>
              </select>
            </div>
            <div>
              <label>Daily Caloric Intake (kcal)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="e.g., 2700"
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Optional: Override calculated calories
              </small>
            </div>
            <div>
              <label>Protein (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.proteinPercentage}
                onChange={(e) => setFormData({ ...formData, proteinPercentage: e.target.value })}
                placeholder="e.g., 30"
              />
              {proteinGrams && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  color: '#1976d2',
                  fontSize: '0.9rem'
                }}>
                  <strong>Calculated Protein:</strong> {proteinGrams} grams
                </div>
              )}
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                Enter percentage of daily calories from protein
              </small>
            </div>
          </div>
          <button type="submit" className="primary" style={{ marginTop: '20px' }}>
            Update Profile
          </button>
        </form>
      </div>

      {tdee && !tdee.error && (
        <div className="card">
          <h3>Your TDEE Calculation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <p><strong>BMR:</strong> {tdee.bmr} kcal/day</p>
              <p><strong>TDEE:</strong> {tdee.tdee} kcal/day</p>
            </div>
            <div>
              <p><strong>Recommended Calories:</strong> {tdee.recommendedCalories} kcal/day</p>
              {tdee.macros && (
                <>
                  <p><strong>Protein:</strong> {tdee.macros.protein}g</p>
                  <p><strong>Carbs:</strong> {tdee.macros.carbs}g</p>
                  <p><strong>Fat:</strong> {tdee.macros.fat}g</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
