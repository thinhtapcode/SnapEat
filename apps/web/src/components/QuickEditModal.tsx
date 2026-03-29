import { useState, useRef } from 'react';
import { X, Save, Scale, Utensils, Zap, Flame } from 'lucide-react';

interface QuickMealModalProps {
  meal?: any; // Nếu có meal là Sửa, không có là Thêm
  onClose: () => void;
  onSave: (data: any) => void;
  isPending?: boolean;
}

export default function QuickMealModal({ meal, onClose, onSave, isPending }: QuickMealModalProps) {
  const MEAL_TYPES = [
    { value: 'BREAKFAST', label: '🍳 Sáng' },
    { value: 'LUNCH', label: '🍲 Trưa' },
    { value: 'DINNER', label: '🌆 Tối' },
    { value: 'SNACK', label: '🍎 Nhẹ' },
  ];
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    totalCalories: meal?.totalCalories || '',
    totalProtein: meal?.totalProtein || '',
    totalCarbs: meal?.totalCarbs || '',
    totalFat: meal?.totalFat || '',
    type: meal?.type || 'LUNCH'
  });

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Ép kiểu dữ liệu để thỏa mãn Validation ở Backend
  const formattedData = {
    name: formData.name.trim(),
    type: formData.type,
    // Chuyển string -> number và xử lý trường hợp input trống thành 0
    totalCalories: Number(formData.totalCalories) || 0,
    totalProtein: Number(formData.totalProtein) || 0,
    totalCarbs: Number(formData.totalCarbs) || 0,
    totalFat: Number(formData.totalFat) || 0,
  };

  onSave(formattedData);
};

  return (
    <div style={modalOverlayStyle}>
      <div className="card" style={modalContentStyle}>
        <header style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Utensils size={20} />
            <h3 style={{ margin: 0 }}>{meal ? 'Chỉnh sửa bữa ăn' : 'Thêm bữa ăn mới'}</h3>
          </div>
          <button onClick={onClose} style={closeButtonStyle}><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
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
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Tên món ăn</label>
            <input 
              style={inputStyle} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Phở bò..." 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div className="input-group">
              <label style={labelStyle}><Flame size={14} /> Calo</label>
              <input style={inputStyle} type="number" value={formData.totalCalories} onChange={e => setFormData({...formData, totalCalories: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={labelStyle}><Zap size={14} /> Protein</label>
              <input style={inputStyle} type="number" value={formData.totalProtein} onChange={e => setFormData({...formData, totalProtein: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={labelStyle}>Carbs</label>
              <input style={inputStyle} type="number" value={formData.totalCarbs} onChange={e => setFormData({...formData, totalCarbs: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={labelStyle}>Chất béo</label>
              <input style={inputStyle} type="number" value={formData.totalFat} onChange={e => setFormData({...formData, totalFat: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={isPending} className="primary" style={submitButtonStyle}>
            <Save size={18} /> {isPending ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Styles ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};

const modalContentStyle: React.CSSProperties = {
  width: '90%', maxWidth: '450px', borderRadius: '25px', overflow: 'hidden',
  backgroundColor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const modalHeaderStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
  padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between'
};

const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', marginTop: '5px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' };
const closeButtonStyle = { background: 'none', border: 'none', color: 'white', cursor: 'pointer' };
const submitButtonStyle = { width: '100%', padding: '14px', borderRadius: '12px', background: '#14532d', color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' };