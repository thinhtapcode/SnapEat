import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { mealApi, aiApi } from '../services/api'
import { DailyMealList } from '../components/DailyMealList'
import {Camera, Edit3, Upload, X} from 'lucide-react';
import CameraScanner from '../components/CameraScanner';
import { notify } from '../utils/notifier';
// import { Camera, Plus, Trash2, CheckCircle, Loader2, Search } from 'lucide-react';


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
  const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [recognizedFoods, setRecognizedFoods] = useState<FoodItem[]>([])
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const MEAL_TYPES = [
    { value: 'BREAKFAST', label: '🍳 Sáng' },
    { value: 'LUNCH', label: '🍲 Trưa' },
    { value: 'DINNER', label: '🌆 Tối' },
    { value: 'SNACK', label: '🍎 Nhẹ' },
  ];
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); 
    };
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
      notify.success('Meal logged successfully!')
    },
    onError: (error: any) => {
      notify.error(`Error logging meal: ${error.response?.data?.message || error.message}`)
    },
  })
  // State để quản lý việc chỉnh sửa
const [editingMealId, setEditingMealId] = useState<string | null>(null);

// Mutation Xóa bữa ăn
const deleteMeal = useMutation({
  mutationFn: mealApi.delete,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
    queryClient.invalidateQueries({ queryKey: ['meals'] });
    notify.success('Đã xóa bữa ăn!');
  },
});

// Mutation Cập nhật bữa ăn
const updateMeal = useMutation({
  mutationFn: ({ id, data }: { id: string; data: any }) => mealApi.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
    queryClient.invalidateQueries({ queryKey: ['meals'] });
    setEditingMealId(null);
    setShowManualForm(false);
    setFormData({ name: '', type: 'LUNCH', totalCalories: '', totalProtein: '', totalCarbs: '', totalFat: '' });
    notify.success('Cập nhật thành công!');
  },
});

// Hàm xử lý khi nhấn nút "Sửa" trên một item
const handleEditClick = (meal: any) => {
  setEditingMealId(meal.id);
  setFormData({
    name: meal.name,
    type: meal.type,
    totalCalories: meal.totalCalories.toString(),
    totalProtein: meal.totalProtein.toString(),
    totalCarbs: meal.totalCarbs.toString(),
    totalFat: meal.totalFat.toString(),
  });
  setShowManualForm(true);
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên để sửa
};


  const { data: dailySummary, isLoading } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: () => mealApi.getDailySummary(),
  });

  // Cập nhật lại handleManualSubmit để xử lý cả Create và Update
const handleManualSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const data = {
    name: formData.name,
    type: formData.type,
    totalCalories: parseFloat(formData.totalCalories),
    totalProtein: parseFloat(formData.totalProtein),
    totalCarbs: parseFloat(formData.totalCarbs),
    totalFat: parseFloat(formData.totalFat),
  };

  if (editingMealId) {
    updateMeal.mutate({ id: editingMealId, data });
  } else {
    createMeal.mutate({ ...data, foods: [], imageUrl: selectedImage || undefined });
  }
};
  // const handlePhotoScan = () => {
  //   fileInputRef.current?.click()
  // }

  const clearImage = () => {
    setSelectedImage(null)
    setRecognizedFoods([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Trong component React của bạn (dựa trên mẫu bạn gửi)
// 1. Cập nhật hàm onFileUpload
const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  setSelectedImage(imageUrl);
  setRecognizedFoods([]); 
  setIsAnalyzing(true); 

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    const response = await fetch(`${AI_URL}/api/scan-food`, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) throw new Error("Server error");
    const data = await response.json();
    
    // Đảm bảo ép kiểu về mảng FoodItem
    const foodArray = Array.isArray(data) ? data : [data];
    setRecognizedFoods(foodArray);

    if (foodArray.length > 0) {
      const topFood = foodArray[0];
      setShowManualForm(true);
      notify.success('Đã phân tích ảnh!');
      // SỬA LẠI CÁCH SET FORM DATA ĐỂ TRÁNH LỖI ĐÈ STATE
      setFormData(prev => ({
        ...prev,
        name: topFood.name,
        totalCalories: topFood.calories.toString(),
        totalProtein: topFood.protein.toString(),
        totalCarbs: topFood.carbs.toString(),
        totalFat: topFood.fat.toString(),
      }));
    }
  } catch (error) {
    notify.error("Lỗi phân tích ảnh. Thử lại nhé!");
  } finally {
    setIsAnalyzing(false);
  }
};
const handleCapture = async (base64Image: string) => {
  setIsCameraOpen(false); 
  setShowImageOptions(false);
  setSelectedImage(base64Image);
  setRecognizedFoods([]);
  setIsAnalyzing(true);

  try {
    // Chuyển Base64 sang File object để tương thích với Backend hiện tại
    const res = await fetch(base64Image);
    const blob = await res.blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    const response = await fetch(`${AI_URL}/api/scan-food`, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) throw new Error("Server error");
    const data = await response.json();
    const foodArray = Array.isArray(data) ? data : [data];
    setRecognizedFoods(foodArray);

    if (foodArray.length > 0) {
      const topFood = foodArray[0];
      setShowManualForm(true);
      setFormData(prev => ({
        ...prev,
        name: topFood.name,
        totalCalories: topFood.calories.toString(),
        totalProtein: topFood.protein.toString(),
        totalCarbs: topFood.carbs.toString(),
        totalFat: topFood.fat.toString(),
      }));
    }
  } catch (error) {
    notify.error("Lỗi phân tích camera.");
  } finally {
    setIsAnalyzing(false);
  }
};


const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setFormData({ ...formData, name: value });
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  if (value.trim().length >= 2) {
    // 2. Đặt timeout mới: Đợi 500ms sau khi ngừng gõ mới gọi API
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await mealApi.searchFoodLibrary(value);
        
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
        notify.error("Lỗi tìm kiếm thực phẩm.");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // ⏱️ 500ms là tỷ lệ vàng giữa mượt mà và tốc độ
  } else {
    setShowSuggestions(false);
  }
};

const [quantity, setQuantity] = useState<number>(100);
const [baseFood, setBaseFood] = useState<FoodItem | null>(null);

const selectSuggestion = (food: FoodItem & { defaultWeight?: number; servingSize?: string }) => {
  setBaseFood(food);
  
  // 1. Lấy trọng lượng mặc định (Nếu nhóm 1 là 100g, nếu nhóm 2 là 1 phần)
  const initQty = food.defaultWeight || 100;
  setQuantity(initQty);

  // 2. Kiểm tra xem món này tính theo Gram hay tính theo Suất (Tô, Dĩa, Ly...)
  const isGramSystem = !food.servingSize || food.servingSize.toLowerCase() === 'gram';

  // 3. Tính toán Hệ số nhân (Ratio)
  // - Nếu là Gram: Lấy (Số lượng / 100)
  // - Nếu là Suất: Giữ nguyên số lượng (Suất * 1 = Suất)
  const ratio = isGramSystem ? initQty / 100 : initQty;

  setFormData({
    ...formData,
    name: food.name,
    totalCalories: (food.calories * ratio).toFixed(1),
    totalProtein: (food.protein * ratio).toFixed(1),
    totalCarbs: (food.carbs * ratio).toFixed(1),
    totalFat: (food.fat * ratio).toFixed(1),
  });

  setShowSuggestions(false);
};
  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);

    if (baseFood) {
      const isGramSystem = !baseFood.servingSize || baseFood.servingSize.toLowerCase() === 'gram';
      const ratio = isGramSystem ? newQty / 100 : newQty;

      setFormData({
        ...formData,
        totalCalories: (baseFood.calories * ratio).toFixed(1),
        totalProtein: (baseFood.protein * ratio).toFixed(1),
        totalCarbs: (baseFood.carbs * ratio).toFixed(1),
        totalFat: (baseFood.fat * ratio).toFixed(1),
      });
    }
  };
  const aiMainButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '20px',
  borderRadius: '16px',
  border: '2px dashed #4CAF50',
  backgroundColor: '#f1f8e9',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  color: '#2e7d32'
};

const aiOptionsContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  border: '2px solid #4CAF50',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  position: 'relative'
};

const aiOptionItemStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#2e7d32',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.9rem',
  fontWeight: '600'
};

const aiCloseOptionStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  
  // QUAN TRỌNG: Reset padding và đặt kích thước cố định
  width: '24px',
  height: '24px',
  padding: 0, 
  
  background: '#9ca3af', // Màu xám
  color: 'white',        // Dấu X trắng
  borderRadius: '50%',
  
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  
  border: '2px solid white',
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  zIndex: 20,
  
  // Đảm bảo không bị co giãn bởi flex/grid của cha
  flexShrink: 0 
};

const manualButtonStyle: React.CSSProperties = {
  padding: '20px',
  borderRadius: '16px',
  border: '2px solid #e0e0e0',
  backgroundColor: 'white',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  color: '#424242'
};


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      {/* HIỂN THỊ CAMERA SCANNER KHI MỞ */}
      {isCameraOpen && (
        <CameraScanner 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Nhật ký bữa ăn</h1>
        <p style={{ color: '#666' }}>Theo dõi dinh dưỡng để đạt mục tiêu sức khỏe của bạn.</p>
      </header>

      {/* SECTION 1: SMART SCAN & MANUAL TOGGLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        {/* KHỐI AI SCANNER VỚI 2 OPTIONS */}
      <div style={{ position: 'relative' }}>
        {!showImageOptions ? (
          <button 
            onClick={() => setShowImageOptions(true)}
            disabled={isAnalyzing}
            style={aiMainButtonStyle}
          >
            <span style={{ fontSize: '2rem' }}><Camera /></span>
            <span style={{ fontWeight: 'bold' }}>Quét ảnh bằng AI</span>
          </button>
        ) : (
          <div style={aiOptionsContainerStyle}>
            <button onClick={() => setIsCameraOpen(true)} style={aiOptionItemStyle}>
              <Camera size={18} /> Chụp trực tiếp
            </button>
            <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
            <button onClick={() => fileInputRef.current?.click()} style={aiOptionItemStyle}>
              <Upload size={18} /> Tải ảnh lên
            </button>
            <button onClick={() => setShowImageOptions(false)} style={aiCloseOptionStyle}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={() => { setShowManualForm(!showManualForm); setEditingMealId(null); }}
        style={manualButtonStyle}
      >
        <span style={{ fontSize: '2rem' }}><Edit3 /></span>
        <span style={{ fontWeight: 'bold' }}>Nhập thủ công</span>
      </button>
    </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        hidden 
        onChange={onFileUpload} 
        accept="image/*"          // Chấp nhận mọi định dạng: .jpg, .png, .heic, .webp...
       // capture="environment"    // Ép mở Camera sau trên điện thoại (Mobile)
      />

      {/* SECTION 2: AI ANALYZING VIEW */}
      {(selectedImage || isAnalyzing) && (
        <div className="card" style={{ padding: '20px', borderRadius: '20px', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000' }}>
            <img 
              src={selectedImage || ''} 
              alt="Food" 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', opacity: isAnalyzing ? 0.6 : 1 }} 
            />
            
            {/* HIỆU ỨNG LOADING SCANNER */}
            {isAnalyzing && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)'
              }}>
                <div className="scanner-line" /> {/* CSS Animation bên dưới */}
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '30px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div className="spinner" /> 
                  <span style={{ fontWeight: 'bold' }}>AI đang phân tích món ăn...</span>
                </div>
              </div>
            )}

            {!isAnalyzing && (
              <button 
                onClick={clearImage}
                style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* AI Result Tags */}
          {recognizedFoods.length > 0 && !isAnalyzing && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>AI ĐÃ NHẬN DIỆN ĐƯỢC:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recognizedFoods.map((f, i) => (
                  <div key={i} style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #bbdefb' }}>
                    ✨ {f.name} ({(f.confidence! * 100).toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: LOGGING FORM */}
      {showManualForm && (
        <div className="card" style={{ padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none' }}>
          <h3 style={{ marginBottom: '20px' }}>Chi tiết bữa ăn</h3>
          <form onSubmit={handleManualSubmit}>
            {/* 🔥 MỚI THÊM: CHỌN MEAL TYPE GỌN GÀNG */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Thời điểm ăn
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button" // 👈 Quan trọng: Không cho nó trigger submit form
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: formData.type === type.value ? '#4CAF50' : '#f3f4f6',
                      color: formData.type === type.value ? 'white' : '#4b5563',
                      boxShadow: formData.type === type.value ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Tên món ăn</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ví dụ: Phở bò, Salad ức gà..."
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                required
              />
              {/* Suggestions Dropdown (giữ nguyên logic của bạn nhưng style lại) */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', width: '100%', zIndex: 10, background: 'white', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginTop: '5px' }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => selectSuggestion(s)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}>
                      <strong>{s.name}</strong> <span style={{ color: '#4CAF50', float: 'right' }}>{s.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div className="input-box">
                <label>Calo</label>
                <input type="number" value={formData.totalCalories} onChange={(e) => setFormData({...formData, totalCalories: e.target.value})} />
              </div>
              <div className="input-box">
                <label>Protein (P)</label>
                <input type="number" value={formData.totalProtein} onChange={(e) => setFormData({...formData, totalProtein: e.target.value})} />
              </div>
              <div className="input-box">
                <label>Carbs (C)</label>
                <input type="number" value={formData.totalCarbs} onChange={(e) => setFormData({...formData, totalCarbs: e.target.value})} />
              </div>
              <div className="input-box">
                <label>Fat (F)</label>
                <input type="number" value={formData.totalFat} onChange={(e) => setFormData({...formData, totalFat: e.target.value})} />
              </div>
            </div>

            {/* ⚖️ NÂNG CẤP UI/UX: Ô NHẬP SỐ LƯỢNG THÔNG MINH */}
            <div style={{ marginBottom: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>
                <span>🔢 Số lượng tiêu thụ</span>
                <span style={{ color: '#4CAF50', fontWeight: '800' }}>
                  Đơn vị: {baseFood?.servingSize || 'Gram'}
                </span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Nút Trừ (-) */}
                <button
                  type="button"
                  onClick={() => {
                    const step = (!baseFood?.servingSize || baseFood.servingSize.toLowerCase() === 'gram') ? 50 : 0.5;
                    const newQty = Math.max(0, quantity - step);
                    handleQuantityChange(newQty);
                  }}
                  style={{
                    width: '45px', height: '45px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#e2e8f0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  -
                </button>

                {/* Input hiển thị số */}
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                  style={{
                    flex: 1, height: '45px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold',
                    borderRadius: '10px', border: '2px solid #cbd5e1', backgroundColor: 'white'
                  }}
                />

                {/* Nút Cộng (+) */}
                <button
                  type="button"
                  onClick={() => {
                    const step = (!baseFood?.servingSize || baseFood.servingSize.toLowerCase() === 'gram') ? 50 : 0.5;
                    const newQty = quantity + step;
                    handleQuantityChange(newQty);
                  }}
                  style={{
                    width: '45px', height: '45px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#4CAF50', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  +
                </button>
              </div>

              <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                💡 Mẹo: Hệ thống tự động chia tỉ lệ Calo/Macros khi bạn tăng giảm số lượng!
              </p>
            </div>

            <button type="submit" className="primary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#4CAF50', border: 'none', color: 'white', cursor: 'pointer' }}>
              {editingMealId ? "Cập nhật bữa ăn ✨" : "Ghi nhận bữa ăn ngay"}
            </button>
            {editingMealId && (
            <button 
              type="button" 
              onClick={() => { setEditingMealId(null); setShowManualForm(false); }}
              style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
            >
              Hủy bỏ chỉnh sửa
            </button>
          )}
          </form>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <DailyMealList 
          meals={dailySummary?.meals} 
          isLoading={isLoading} 
          onDelete={(id: string) => {
            if(window.confirm('Bạn có chắc chắn muốn xóa?')) deleteMeal.mutate(id)
          }}
          onEdit={handleEditClick}
        />
      </div>

      {/* THÊM CSS TRONG FILE INDEX.CSS HOẶC TRỰC TIẾP */}
      <style>{`
        .scanner-line {
          position: absolute;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, transparent, #4CAF50, transparent);
          box-shadow: 0 0 15px #4CAF50;
          animation: scan 2s infinite ease-in-out;
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .input-box input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #eee;
          background: #fafafa;
          text-align: center;
        }
        .input-box label {
          display: block;
          font-size: 0.75rem;
          color: #888;
          text-align: center;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  )
}
