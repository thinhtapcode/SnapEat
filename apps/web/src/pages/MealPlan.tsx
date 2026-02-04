import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mealPlanApi, tdeeApi } from '../services/api'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function MealPlan() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + ONE_WEEK_MS).toISOString().split('T')[0],
    dailyCalories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  // Fetch current macro data from TDEE
  const { data: tdee } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  })

  // Fetch existing meal plans
  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: mealPlanApi.getAll,
  })

  // Create meal plan mutation
  const createPlan = useMutation({
    mutationFn: mealPlanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
      setShowForm(false)
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + ONE_WEEK_MS).toISOString().split('T')[0],
        dailyCalories: '',
        protein: '',
        carbs: '',
        fat: '',
      })
      alert('Meal plan created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating meal plan:', error)
      alert('Failed to create meal plan. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date range
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (endDate <= startDate) {
      alert('End date must be after start date')
      return
    }
    
    // Validate numeric values
    const calories = parseFloat(formData.dailyCalories)
    const pPercent = parseFloat(formData.protein); // Giờ là %
    const cPercent = parseFloat(formData.carbs);   // Giờ là %
    const fPercent = parseFloat(formData.fat);
    if (pPercent + cPercent + fPercent !== 100) {
    alert('Tổng phần trăm Protein, Carbs, Fat phải bằng 100%');
    return;
    }

    const proteinGram = Math.round((calories * (pPercent / 100)) / 4);
    const carbsGram = Math.round((calories * (cPercent / 100)) / 4);
    const fatGram = Math.round((calories * (fPercent / 100)) / 9);
    
    if (isNaN(calories) || isNaN(proteinGram) || isNaN(carbsGram) || isNaN(fatGram)) {
      alert('Please enter valid numbers for all nutrition fields')
      return
    }
    
    createPlan.mutate({
      name: formData.name,
      startDate: new Date(formData.startDate).toISOString(), // Chuyển sang chuẩn ISO
      endDate: new Date(formData.endDate).toISOString(),
      dailyCalories: calories,
      dailyMacros: {
        protein: proteinGram,
        carbs: carbsGram,
        fat: fatGram,
      },
    })
  }

  const useTdeeValues = () => {
    if (tdee && !tdee.error) {
      setFormData({
        ...formData,
        dailyCalories: tdee.recommendedCalories?.toString() || '',
        protein: tdee.macros?.protein?.toString() || '',
        carbs: tdee.macros?.carbs?.toString() || '',
        fat: tdee.macros?.fat?.toString() || '',
      })
    }
  }

  const useTemplate = (plan: any) => {
  const totalCal = plan.dailyCalories;
  const p = plan.dailyMacros?.protein || 0;
  const c = plan.dailyMacros?.carbs || 0;
  const f = plan.dailyMacros?.fat || 0;

  // Tính ngược Gram -> % để điền vào Form
  const pPercent = Math.round((p * 4 / totalCal) * 100);
  const cPercent = Math.round((c * 4 / totalCal) * 100);
  const fPercent = 100 - pPercent - cPercent;

  setFormData({
    name: `${plan.name} (Copy)`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + ONE_WEEK_MS).toISOString().split('T')[0],
    dailyCalories: totalCal.toString(),
    protein: pPercent.toString(),
    carbs: cPercent.toString(),
    fat: fPercent.toString(),
  });
  
  setShowForm(true);

  // Kích hoạt cập nhật Profile ngay lập tức
  if (plan.id) {
    applyMacroMutation.mutate(plan.id); 
  }
};

// Khai báo Mutation
// Chỉ định rõ kiểu dữ liệu đầu vào là string cho Mutation
const applyMacroMutation = useMutation({
  mutationFn: (planId: string) => mealPlanApi.apply(planId), 
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tdee'] });
    alert('Đã cập nhật mục tiêu dinh dưỡng hiện tại theo Template này!');
  },
  onError: (error) => {
    console.error("Lỗi khi áp dụng template:", error);
    alert("Không thể áp dụng template. Vui lòng thử lại.");
  }
});

const resetTargetMutation = useMutation({
  mutationFn: tdeeApi.resetTarget,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tdee'] });
    alert('Đã quay lại sử dụng mục tiêu dinh dưỡng khuyến nghị!');
  }
});
const displayData = tdee?.current || (tdee?.recommend ? {
  calories: tdee.recommend.calories,
  macros: tdee.recommend.macros
} : null);

const isUsingAppliedPlan = !!tdee?.current;
return (
<div>
<h1>Meal Plans</h1>

      {/* Current Macro Display */}
      {displayData && (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>
            Current Targets {isUsingAppliedPlan ? "(Custom Plan)" : "(Recommended)"}
          </h3>
          
          {isUsingAppliedPlan && (
            <button 
              className="secondary" 
              style={{ fontSize: '12px', padding: '5px 10px' }}
              onClick={() => resetTargetMutation.mutate()}
            >
              Reset to Recommended
            </button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {displayData.calories || displayData.recommendedCalories}
            </p>
            <p>Calories</p>
          </div>
          {/* ... Protein, Carbs, Fat làm tương tự ... */}
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196F3' }}>
              {displayData.macros?.protein}g
            </p>
            <p>Protein</p>
          </div>
          {/* ... */}
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF9800' }}>
              {displayData.macros?.carbs}g
            </p>
            <p>Carbs</p>
          </div>
          {/* ... */}
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff62c0' }}>
              {displayData.macros?.fat}g
            </p>
            <p>Fat</p>
          </div>
        </div>
      </div>
    )}

      {/* Create New Plan */}
<div className="card">
        <h3>Create Meal Plan</h3>
        <p>Meal planning features will be implemented here.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Create New Plan'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div>
              <label>Plan Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Cutting Plan"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label>Daily Calorie Target</label>
              <input
                type="number"
                value={formData.dailyCalories}
                onChange={(e) => setFormData({ ...formData, dailyCalories: e.target.value })}
                placeholder="e.g., 2000"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <label>Protein (%)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="e.g., 30"
                  required
                />
              </div>
              <div>
                <label>Carbs (%)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  placeholder="e.g., 40"
                  required
                />
              </div>
              <div>
                <label>Fat (%)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  placeholder="e.g., 30"
                  required
                />
              </div>
            </div>

            {tdee && !tdee.error && (
              <button 
                type="button" 
                className="secondary" 
                onClick={useTdeeValues}
                style={{ marginTop: '10px' }}
              >
                Use Current TDEE Values
              </button>
            )}

            <button type="submit" className="primary" style={{ marginTop: '10px', marginLeft: '10px' }}>
              Create Plan
            </button>
          </form>
        )}
      </div>

      {/* Existing Plans (Templates) */}
      <div className="card">
        <h3>Saved Meal Plans</h3>
        {isLoading ? (
          <p>Loading meal plans...</p>
        ) : mealPlans && mealPlans.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {mealPlans.map((plan: any) => (
              <div 
                key={plan.id} 
                style={{ 
                  padding: '15px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0' }}>{plan.name}</h4>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Duration:</strong> {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Daily Calories:</strong> {plan.dailyCalories} kcal
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Macros:</strong> P: {plan.dailyMacros?.protein || 0}g | 
                      C: {plan.dailyMacros?.carbs || 0}g | 
                      F: {plan.dailyMacros?.fat || 0}g
                    </p>
                  </div>
                  <button 
                    className="secondary" 
                    onClick={() => useTemplate(plan)}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    Use as Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No meal plans created yet. Create your first plan above!</p>
        )}
</div>
</div>
)
}