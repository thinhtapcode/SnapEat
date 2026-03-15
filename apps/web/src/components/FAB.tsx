import { useState, useRef, useEffect } from 'react';
import { Plus, Camera, Edit3, X, Flame, Zap, Target, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealApi } from '../services/api';
import  CameraScanner  from './CameraScanner';

export default function FloatingAddButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showAISubMenu, setShowAISubMenu] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Hàm reset khi đóng FAB
const toggleFab = () => {
  setIsOpen(!isOpen);
  setShowAISubMenu(false); // Reset menu con khi đóng/mở lại
};
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'LUNCH',
    totalCalories: '',
    totalProtein: '',
    totalCarbs: '',
    totalFat: '',
  });

  // 1. Logic ẩn FAB khi ở trang Meal Log
  if (location.pathname === '/meal-log') return null;

  // 2. Mutation thêm món
  const createMeal = useMutation({
    mutationFn: mealApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      handleCloseModal();
      alert('Ghi nhận bữa ăn thành công!');
    },
  });

  // 3. Logic xử lý File / Camera
  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);
    setShowModal(true);
    setIsOpen(false);
    setShowAISubMenu(false)

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch(`${API_URL}/api/scan-food`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      const food = Array.isArray(data) ? data[0] : data;

      if (food) {
        setFormData({
          name: food.name,
          type: 'LUNCH',
          totalCalories: food.calories.toString(),
          totalProtein: food.protein.toString(),
          totalCarbs: food.carbs.toString(),
          totalFat: food.fat.toString(),
        });
      }
    } catch (error) {
      alert("Lỗi AI scan. Bạn hãy nhập tay nhé!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Logic Search gợi ý (Y hệt MealLog)
  const handleNameChange = async (value: string) => {
    setFormData({ ...formData, name: value });
    if (value.trim().length >= 2) {
      try {
        const results = await mealApi.searchFoodLibrary(value);
        const finalData = Array.isArray(results) ? results : [results];
        setSuggestions(finalData);
        setShowSuggestions(finalData.length > 0);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setIsAnalyzing(false);
    setFormData({ name: '', type: 'LUNCH', totalCalories: '', totalProtein: '', totalCarbs: '', totalFat: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMeal.mutate({
      ...formData,
      totalCalories: parseFloat(formData.totalCalories) || 0,
      totalProtein: parseFloat(formData.totalProtein) || 0,
      totalCarbs: parseFloat(formData.totalCarbs) || 0,
      totalFat: parseFloat(formData.totalFat) || 0,
      foods: [],
      imageUrl: selectedImage || undefined
    });
  };

  const handleCapture = async (base64Image: string) => {
    setIsCameraOpen(false); // Đóng camera
    setSelectedImage(base64Image); // Hiện preview trong Modal
    setIsAnalyzing(true);
    setShowModal(true);

    // CHUYỂN BASE64 SANG FILE ĐỂ GỬI LÊN FASTAPI
    const res = await fetch(base64Image);
    const blob = await res.blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
        const response = await fetch(`${API_URL}/api/scan-food`, {
        method: 'POST',
        body: formDataToSend,
        });
        const data = await response.json();
        const food = Array.isArray(data) ? data[0] : data;

      if (food) {
        setFormData({
          name: food.name,
          type: 'LUNCH',
          totalCalories: food.calories.toString(),
          totalProtein: food.protein.toString(),
          totalCarbs: food.carbs.toString(),
          totalFat: food.fat.toString(),
        });
      }
    } catch (err) {
        alert("Lỗi AI");
    } finally {
        setIsAnalyzing(false);
    }
};

const subFabSubStyle: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  cursor: 'pointer',
  marginRight: '10px' // Thụt vào một chút so với menu chính
};

const iconCircleSubStyle: React.CSSProperties = { 
  width: '38px', 
  height: '38px', 
  borderRadius: '50%', 
  background: '#f0fdf4', // Màu nền nhạt hơn
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
  color: '#10b981' 
};

const fabLabelSubStyle: React.CSSProperties = { 
  background: '#4b5563', // Màu xám nhạt hơn nhãn chính
  color: 'white', 
  padding: '4px 10px', 
  borderRadius: '6px', 
  fontSize: '0.7rem' 
};
  return (
    <>
        {isCameraOpen && (
      <CameraScanner 
        onCapture={handleCapture} 
        onClose={() => setIsCameraOpen(false)} 
      />
    )}
    
      {/* --- QUICK ADD MODAL --- */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <header style={headerStyle}>
              <h3 style={{ margin: 0 }}>Thêm bữa ăn nhanh</h3>
              <X onClick={handleCloseModal} cursor="pointer" />
            </header>

            {/* AI Scan View (Đồng bộ giao diện với MealLog) */}
            {selectedImage && (
              <div style={imageContainerStyle}>
                <img src={selectedImage} style={{ 
                  width: '100%', height: '200px', objectFit: 'cover', 
                  opacity: isAnalyzing ? 0.6 : 1 
                }} />
                {isAnalyzing && (
                  <>
                    <div className="scanner-line" />
                    <div style={scanningLabelStyle}>AI đang phân tích...</div>
                  </>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              {/* Name Input with Suggestions */}
              <div style={{ position: 'relative', marginBottom: '15px' }}>
                <label style={labelStyle}>Tên món ăn</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={inputStyle}
                  required
                />
                {showSuggestions && (
                  <div style={dropdownStyle}>
                    {suggestions.map((s, i) => (
                      <div key={i} onClick={() => {
                        setFormData({...formData, name: s.name, totalCalories: s.calories, totalProtein: s.protein, totalCarbs: s.carbs, totalFat: s.fat});
                        setShowSuggestions(false);
                      }} style={suggestionItemStyle}>
                        <span>{s.name}</span>
                        <span style={{ color: '#4CAF50' }}>{s.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Macros Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={inputGroupStyle}><label style={labelStyle}>🔥 Calo</label>
                  <input type="number" value={formData.totalCalories} onChange={e => setFormData({...formData, totalCalories: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}><label style={labelStyle}>🥩 Protein</label>
                  <input type="number" value={formData.totalProtein} onChange={e => setFormData({...formData, totalProtein: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}><label style={labelStyle}>🍞 Carbs</label>
                  <input type="number" value={formData.totalCarbs} onChange={e => setFormData({...formData, totalCarbs: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}><label style={labelStyle}>🥑 Fat</label>
                  <input type="number" value={formData.totalFat} onChange={e => setFormData({...formData, totalFat: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <button type="submit" disabled={createMeal.isPending || isAnalyzing} style={submitButtonStyle}>
                {createMeal.isPending ? 'Đang lưu...' : 'Ghi nhận ngay 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING BUTTON --- */}
      <div style={fabContainerStyle}>
        <input 
            ref={fileInputRef} 
            type="file" 
            hidden 
            onChange={onFileUpload} 
            accept="image/*" 
            //capture="environment" 
        />
        
        {isOpen && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
    
    {/* --- NHÓM OPTION AI SCANNER --- */}
    {!showAISubMenu ? (
      // Menu chính: Chọn AI Scanner
      <div onClick={() => setShowAISubMenu(true)} style={subFabStyle}>
        <span style={fabLabelStyle}>AI Scanner</span>
        <div style={iconCircleStyle}><Camera size={20} color="#10b981" /></div>
      </div>
    ) : (
      // Menu con của AI: Hiện sau khi bấm vào AI Scanner
      <>
        <div onClick={() => setIsCameraOpen(true)} style={subFabSubStyle}>
          <span style={fabLabelSubStyle}>Chụp ảnh trực tiếp</span>
          <div style={iconCircleSubStyle}><Camera size={18} /></div>
        </div>
        
        <div onClick={() => fileInputRef.current?.click()} style={subFabSubStyle}>
          <span style={fabLabelSubStyle}>Tải ảnh từ máy</span>
          <div style={iconCircleSubStyle}><Plus size={18} /></div>
        </div>

        {/* Nút quay lại menu chính (Tùy chọn) */}
        <div onClick={() => setShowAISubMenu(false)} style={{...subFabSubStyle, opacity: 0.7}}>
          <span style={fabLabelSubStyle}>Quay lại</span>
          <div style={iconCircleSubStyle}><X size={14} /></div>
        </div>
      </>
    )}

    {/* --- OPTION NHẬP THỦ CÔNG --- */}
    {!showAISubMenu && (
      <div onClick={() => { setShowModal(true); setIsOpen(false); }} style={subFabStyle}>
        <span style={fabLabelStyle}>Nhập thủ công</span>
        <div style={iconCircleStyle}><Edit3 size={20} color="#10b981" /></div>
      </div>
    )}
  </div>
)}

{/* Nút chính */}
<button onClick={toggleFab} style={mainFabStyle(isOpen)}>
  <Plus size={30} style={{ transition: '0.3s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }} />
</button>
      </div>

      <style>{`
        .scanner-line {
          position: absolute; top: 0; width: 100%; height: 4px;
          background: linear-gradient(to right, transparent, #4CAF50, transparent);
          box-shadow: 0 0 15px #4CAF50; animation: scan 2s infinite ease-in-out;
        }
        @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
      `}</style>
    </>
  );
}

// --- STYLES ---
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalStyle: React.CSSProperties = { background: 'white', width: '90%', maxWidth: '450px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' };
const headerStyle: React.CSSProperties = { padding: '20px', background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const imageContainerStyle: React.CSSProperties = { position: 'relative', height: '200px', background: '#000' };
const scanningLabelStyle: React.CSSProperties = { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', marginTop: '5px', outline: 'none' };
const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#666' };
const dropdownStyle: React.CSSProperties = { position: 'absolute', width: '100%', background: 'white', border: '1px solid #eee', borderRadius: '12px', zIndex: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', top: '100%' };
const suggestionItemStyle = { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between' };
const submitButtonStyle = { width: '100%', padding: '15px', borderRadius: '12px', background: '#064e3b', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const fabContainerStyle: React.CSSProperties = { position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const mainFabStyle = (isOpen: boolean): React.CSSProperties => ({ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(6, 78, 59, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' });
const subFabStyle = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const iconCircleStyle = { width: '45px', height: '45px', borderRadius: '50%', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#064e3b' };
const fabLabelStyle = { background: '#333', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column' as const };