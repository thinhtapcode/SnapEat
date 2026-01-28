import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mealApi, aiApi } from '../services/api'

interface FoodItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize?: string
  confidence?: number
}

export default function MealLog() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [recognizedFoods, setRecognizedFoods] = useState<FoodItem[]>([])
  const [formData, setFormData] = useState({
    name: '',
    type: 'LUNCH',
    totalCalories: '',
    totalProtein: '',
    totalCarbs: '',
    totalFat: '',
  })

  // Create meal mutation
  const createMeal = useMutation({
    mutationFn: mealApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] })
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      setShowManualForm(false)
      setSelectedImage(null)
      setRecognizedFoods([])
      setFormData({
        name: '',
        type: 'LUNCH',
        totalCalories: '',
        totalProtein: '',
        totalCarbs: '',
        totalFat: '',
      })
      alert('Meal logged successfully!')
    },
    onError: (error: any) => {
      alert(`Error logging meal: ${error.response?.data?.message || error.message}`)
    },
  })

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMeal.mutate({
      name: formData.name,
      type: formData.type,
      foods: [],
      totalCalories: parseFloat(formData.totalCalories),
      totalProtein: parseFloat(formData.totalProtein),
      totalCarbs: parseFloat(formData.totalCarbs),
      totalFat: parseFloat(formData.totalFat),
      imageUrl: selectedImage || undefined,
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to base64 for preview and AI analysis
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string
      setSelectedImage(base64Image)
      setIsAnalyzing(true)

      try {
        // Call AI service to recognize food
        const result = await aiApi.recognizeFood(base64Image)
        
        if (result.success && result.foods && result.foods.length > 0) {
          setRecognizedFoods(result.foods)
          
          // Auto-fill form with recognized food data
          const totalCalories = result.foods.reduce((sum: number, food: any) => sum + food.calories, 0)
          const totalProtein = result.foods.reduce((sum: number, food: any) => sum + food.protein, 0)
          const totalCarbs = result.foods.reduce((sum: number, food: any) => sum + food.carbs, 0)
          const totalFat = result.foods.reduce((sum: number, food: any) => sum + food.fat, 0)
          const foodNames = result.foods.map((f: any) => f.name).join(', ')

          setFormData({
            ...formData,
            name: foodNames,
            totalCalories: totalCalories.toFixed(1),
            totalProtein: totalProtein.toFixed(1),
            totalCarbs: totalCarbs.toFixed(1),
            totalFat: totalFat.toFixed(1),
          })
          setShowManualForm(true)
        } else {
          alert('No food items recognized. Please try another image or enter manually.')
        }
      } catch (error: any) {
        console.error('Error analyzing image:', error)
        alert(`Error analyzing image: ${error.message || 'Unknown error'}`)
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoScan = () => {
    fileInputRef.current?.click()
  }

  const clearImage = () => {
    setSelectedImage(null)
    setRecognizedFoods([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <h1>Meal Logging</h1>

      {/* Photo Upload Section */}
      <div className="card">
        <h3>Scan Food Photo (AI Recognition)</h3>
        <p>Upload a photo of your meal and let AI analyze the nutritional content.</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        
        <div style={{ marginTop: '15px' }}>
          <button className="secondary" onClick={handlePhotoScan} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Upload & Scan Photo'}
          </button>
          
          {selectedImage && (
            <button 
              className="primary" 
              onClick={clearImage}
              style={{ marginLeft: '10px', backgroundColor: '#f44336' }}
            >
              Clear Image
            </button>
          )}
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div style={{ marginTop: '20px' }}>
            <h4>Image Preview:</h4>
            <img 
              src={selectedImage} 
              alt="Food preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '8px',
                border: '2px solid #ddd'
              }} 
            />
          </div>
        )}

        {/* AI Recognition Results */}
        {recognizedFoods.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>AI Recognized Foods:</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {recognizedFoods.map((food, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#f0f8ff', 
                    borderRadius: '5px',
                    border: '1px solid #4CAF50'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{food.name}</strong>
                    {food.confidence && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: food.confidence > 0.8 ? '#4CAF50' : '#FF9800',
                        fontWeight: 'bold'
                      }}>
                        {(food.confidence * 100).toFixed(0)}% confident
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    {food.calories.toFixed(0)} kcal | 
                    P: {food.protein.toFixed(1)}g | 
                    C: {food.carbs.toFixed(1)}g | 
                    F: {food.fat.toFixed(1)}g
                    {food.servingSize && ` (${food.servingSize})`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Meal Logging */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Manual Meal Entry</h3>
          <button 
            className="primary" 
            onClick={() => setShowManualForm(!showManualForm)}
          >
            {showManualForm ? 'Cancel' : 'Add Manual Meal'}
          </button>
        </div>

        {showManualForm && (
          <form onSubmit={handleManualSubmit} style={{ marginTop: '20px' }}>
            <div>
              <label>Meal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken Salad"
                required
              />
            </div>

            <div>
              <label>Meal Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalCalories}
                  onChange={(e) => setFormData({ ...formData, totalCalories: e.target.value })}
                  placeholder="e.g., 450"
                  required
                />
              </div>
              <div>
                <label>Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalProtein}
                  onChange={(e) => setFormData({ ...formData, totalProtein: e.target.value })}
                  placeholder="e.g., 35"
                  required
                />
              </div>
              <div>
                <label>Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalCarbs}
                  onChange={(e) => setFormData({ ...formData, totalCarbs: e.target.value })}
                  placeholder="e.g., 25"
                  required
                />
              </div>
              <div>
                <label>Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalFat}
                  onChange={(e) => setFormData({ ...formData, totalFat: e.target.value })}
                  placeholder="e.g., 18"
                  required
                />
              </div>
            </div>

            {recognizedFoods.length > 0 && (
              <div className="success" style={{ marginTop: '10px' }}>
                ✓ Values auto-filled from AI recognition. You can edit them if needed.
              </div>
            )}

            <button type="submit" className="primary" style={{ marginTop: '20px' }}>
              Log Meal
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
