import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { mealApi, aiApi } from '../services/api'
import { DailyMealList } from '../components/DailyMealList';


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
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
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
  });
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const { data: dailySummary, isLoading } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: () => mealApi.getDailySummary(),
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate numeric values
    const calories = parseFloat(formData.totalCalories)
    const protein = parseFloat(formData.totalProtein)
    const carbs = parseFloat(formData.totalCarbs)
    const fat = parseFloat(formData.totalFat)
    
    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
      alert('Please enter valid numbers for all nutrition fields')
      return
    }
    
    createMeal.mutate({
      name: formData.name,
      type: formData.type,
      foods: [],
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFat: fat,
      imageUrl: selectedImage || undefined,
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please select an image smaller than 5MB.')
      return
    }

    // Convert to base64 for preview and AI analysis
    const reader = new FileReader()
    
    reader.onerror = () => {
      console.error('Error reading file')
      alert('Failed to read the image file. Please try again.')
      setIsAnalyzing(false)
    }
    
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
        alert('Failed to analyze the image. Please try again or enter meal details manually.')
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

  // Thêm vào bên trong Component MealLog, trước phần return

// const handleNameBlur = async () => {
//   // Chỉ tìm kiếm khi tên có ít nhất 2 ký tự và không phải do AI điền sẵn
//   if (formData.name.length < 2 || recognizedFoods.length > 0) return;

//   setIsAnalyzing(true); // Dùng chung state loading với AI photo
//   try {
//     // Gọi đến Endpoint mới của NestJS (FoodLibraryService)
//     const food = await mealApi.searchFoodLibrary(formData.name);

//     if (food) {
//       setFormData(prev => ({
//         ...prev,
//         totalCalories: food.calories.toString(),
//         totalProtein: food.protein.toString(),
//         totalCarbs: food.carbs.toString(),
//         totalFat: food.fat.toString(),
//       }));
//       // Bạn có thể dùng toast hoặc thông báo nhỏ để user biết số đã được cập nhật
//     }
//   } catch (error) {
//     console.log("Món mới, người dùng sẽ tự nhập thông số");
//   } finally {
//     setIsAnalyzing(false);
//   }
// };
//   const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   setFormData({ ...formData, name: value });

//   if (value.length >= 2) {
//     try {
//       // Gọi API search từ database (Lớp 1 của Hybrid)
//       const results = await mealApi.searchFoodLibrary(value);
//       setSuggestions(Array.isArray(results) ? results : [results]);
//       setShowSuggestions(true);
//     } catch (error) {
//       setSuggestions([]);
//     }
//   } else {
//     setSuggestions([]);
//     setShowSuggestions(false);
//   }
// };
// Thêm state để giữ timeout
const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);


const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setFormData({ ...formData, name: value });

  if (value.trim().length >= 2) {
    try {
      const results = await mealApi.searchFoodLibrary(value);
      
      // Đảm bảo luôn luôn là mảng để tránh lỗi .map()
      let finalData: FoodItem[] = [];
      if (Array.isArray(results)) {
        finalData = results;
      } else if (results && typeof results === 'object') {
        finalData = [results as FoodItem];
      }

      setSuggestions(finalData);
      setShowSuggestions(finalData.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  } else {
    setShowSuggestions(false);
  }
};

const selectSuggestion = (food: FoodItem) => {
    setFormData({
      ...formData,
      name: food.name,
      totalCalories: food.calories.toString(),
      totalProtein: food.protein.toString(),
      totalCarbs: food.carbs.toString(),
      totalFat: food.fat.toString(),
    });
    setShowSuggestions(false);
  };

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
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          aria-label="Upload food image for AI analysis"
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
              alt="Uploaded food image for nutritional analysis" 
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
            <div style={{ position: 'relative' }}>
  <label>Meal Name</label>
  <input
    type="text"
    value={formData.name}
    onChange={handleNameChange}
    placeholder="e.g., Phở bò, Ức gà..."
    required
    disabled={isAnalyzing}
    autoComplete="off"
  />

  {/* Dropdown gợi ý */}
  {showSuggestions && suggestions.length > 0 && (
    <div 
      ref={suggestionRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 100,
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {suggestions.map((food, index) => (
        <div
          key={index}
          onClick={() => selectSuggestion(food)}
          style={{
            padding: '12px 15px',
            cursor: 'pointer',
            borderBottom: index !== suggestions.length - 1 ? '1px solid #eee' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <div>
            <div style={{ fontWeight: 'bold', color: '#333' }}>{food.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}></div>
          </div>
          <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            {food.calories} kcal
          </div>
        </div>
      ))}
    </div>
  )}
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
                  min="0"
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
                  min="0"
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
                  min="0"
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
                  min="0"
                  value={formData.totalFat}
                  onChange={(e) => setFormData({ ...formData, totalFat: e.target.value })}
                  placeholder="e.g., 18"
                  required
                />
              </div>
            </div>

            {recognizedFoods.length > 0 ? (
              <div className="success" style={{ marginTop: '10px' }}>
                ✓ Giá trị được tự động điền từ AI nhận diện hình ảnh.
              </div>
            ) : isAnalyzing ? (
              <div className="info" style={{ marginTop: '10px', color: '#2196F3' }}>
                ⏳ Đang kiểm tra dữ liệu dinh dưỡng...
              </div>
            ) : null}

            <button type="submit" className="primary" style={{ marginTop: '20px' }}>
              Log Meal
            </button>
          </form>
        )}
        <DailyMealList meals={dailySummary?.meals} isLoading={isLoading} />
      </div>
    </div>
  )
}
