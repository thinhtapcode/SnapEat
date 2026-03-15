import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mealPlanApi, tdeeApi } from '../services/api'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function MealPlan() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [appliedPlanId, setAppliedPlanId] = useState<string | null>(() => {
  return localStorage.getItem('activePlanId');
});
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
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

  const deletePlan = useMutation({
  mutationFn: (id: string) => mealPlanApi.remove(id),
  onSuccess: (_, deletedId) => {
    queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    
    // Nếu xóa đúng cái đang được hiển thị tên, hãy reset ID
    if (deletedId === appliedPlanId) {
      setAppliedPlanId(null);
      localStorage.removeItem('activePlanId');
    }
    alert('Đã xóa kế hoạch thành công!');
  },
  onError: () => alert('Không thể xóa kế hoạch này.')
});

  const updatePlan = useMutation({
  mutationFn: ({ id, data }: { id: string, data: any }) => mealPlanApi.update(id, data),
  onSuccess: (_, variables) => {
    // 1. Refresh lại danh sách template
    queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    
    // 2. Kiểm tra: Nếu cái vừa update là cái đang được "Applied"
    if (variables.id === appliedPlanId) {
      // Gọi luôn mutation apply để đồng bộ lên Profile/TDEE
      applyMacroMutation.mutate(variables.id);
    }

    setShowForm(false);
    setEditingPlanId(null);
    alert('Cập nhật và đồng bộ kế hoạch thành công! ✨');
  }
});
  const handleEditClick = (plan: any) => {
  const totalCal = plan.dailyCalories;
  const p = plan.dailyMacros?.protein || 0;
  const c = plan.dailyMacros?.carbs || 0;
  
  // Tính ngược Gram -> % cho Form
  const pPercent = Math.round((p * 4 / totalCal) * 100);
  const cPercent = Math.round((c * 4 / totalCal) * 100);
  const fPercent = 100 - pPercent - cPercent;

  setFormData({
    name: plan.name,
    startDate: new Date(plan.startDate).toISOString().split('T')[0],
    endDate: new Date(plan.endDate).toISOString().split('T')[0],
    dailyCalories: totalCal.toString(),
    protein: pPercent.toString(),
    carbs: cPercent.toString(),
    fat: fPercent.toString(),
  });
  
  setEditingPlanId(plan.id);
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
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
  e.preventDefault();
  
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  if (endDate <= startDate) return alert('Ngày kết thúc phải sau ngày bắt đầu');
  
  const calories = parseFloat(formData.dailyCalories);
  const pPercent = parseFloat(formData.protein);
  const cPercent = parseFloat(formData.carbs);
  const fPercent = parseFloat(formData.fat);

  if (pPercent + cPercent + fPercent !== 100) return alert('Tổng phải bằng 100%');

  const proteinGram = Math.round((calories * (pPercent / 100)) / 4);
  const carbsGram = Math.round((calories * (cPercent / 100)) / 4);
  const fatGram = Math.round((calories * (fPercent / 100)) / 9);

  const payload = {
    name: formData.name,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    dailyCalories: calories,
    dailyMacros: { protein: proteinGram, carbs: carbsGram, fat: fatGram },
  };

  if (editingPlanId) {
    updatePlan.mutate({ id: editingPlanId, data: payload });
  } else {
    createPlan.mutate(payload);
  }
};

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

  
  setAppliedPlanId(plan.id);
  localStorage.setItem('activePlanId', plan.id);
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
    // 1. Xóa trạng thái đang dùng trong UI
    setAppliedPlanId(null);
    // 2. Xóa bộ nhớ tạm
    localStorage.removeItem('activePlanId');
    // 3. Cập nhật lại dữ liệu từ server
    queryClient.invalidateQueries({ queryKey: ['tdee'] });
    queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    
    alert('Đã quay lại sử dụng mục tiêu dinh dưỡng khuyến nghị!');
  }
});


const MacroBar = ({ p, c, f }: { p: number, c: number, f: number }) => {
    const total = p + c + f || 1;
    return (
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '10px', backgroundColor: '#eee' }}>
        <div style={{ width: `${(p/total)*100}%`, backgroundColor: '#2196F3' }} title="Protein" />
        <div style={{ width: `${(c/total)*100}%`, backgroundColor: '#FF9800' }} title="Carbs" />
        <div style={{ width: `${(f/total)*100}%`, backgroundColor: '#f44336' }} title="Fat" />
      </div>
    );
  };

const isUsingAppliedPlan = 
  !!tdee?.current && 
  (tdee.current.calories !== tdee.recommend?.calories);

const displayData = isUsingAppliedPlan 
  ? tdee?.current 
  : tdee?.recommend;

  const currentPlan = mealPlans?.find((p: any) => p.id === appliedPlanId);
  let displayTitle = "Mục tiêu gợi ý từ SnapEat";
  if (isUsingAppliedPlan) {
  // Ưu tiên 1: Tìm theo ID từ localStorage
  // Ưu tiên 2: Tìm theo thông số calo (nếu ID không khớp)
  displayTitle = currentPlan?.name || 
                 mealPlans?.find((p: any) => p.dailyCalories === tdee?.current?.calories)?.name || 
                 "Mục tiêu tùy chỉnh";
}

return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Kế hoạch ăn uống</h1>
          <p style={{ color: '#666' }}>Thiết lập mục tiêu dinh dưỡng dài hạn cho bạn</p>
        </div>
        <button 
          className={showForm ? "secondary" : "primary"} 
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' }}
        >
          {showForm ? '✖ Hủy bỏ' : '➕ Tạo kế hoạch mới'}
        </button>
      </header>

      {/* 1. CURRENT TARGETS SECTION - Thẻ mục tiêu hiện tại */}
      {displayData && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
          color: 'white', 
          borderRadius: '20px', 
          padding: '25px',
          border: 'none',
          marginBottom: '30px',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {displayTitle} {isUsingAppliedPlan ? "🎯" : "✨"}
            </span>
            <span style={{ 
              backgroundColor: isUsingAppliedPlan ? 'rgba(255, 193, 7, 0.3)' : 'rgba(76, 175, 80, 0.3)', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.8rem' 
            }}>
              {isUsingAppliedPlan ? "ĐANG ÁP DỤNG" : "HỆ THỐNG"}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{displayData.calories}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Calories</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{displayData.macros?.protein}g</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Protein</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{displayData.macros?.carbs}g</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Carbs</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{displayData.macros?.fat}g</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Fat</div>
            </div>
          </div>

          {isUsingAppliedPlan && (
            <button 
              onClick={() => resetTargetMutation.mutate()}
              style={{ marginTop: '20px', width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
            >
              🔄 Quay lại mức khuyến nghị
            </button>
          )}
        </div>
      )}

      {/* 2. CREATE FORM SECTION */}
      {showForm && (
        <div className="card" style={{ borderRadius: '20px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '25px' }}>Cấu hình kế hoạch mới</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên kế hoạch</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Tuần Siết Cơ 01..."
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày bắt đầu</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày kết thúc</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Thông số Calories & Macros (%)</label>
                <button type="button" onClick={useTdeeValues} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                  ✨ Lấy từ TDEE hiện tại
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
                <input type="number" value={formData.dailyCalories} onChange={(e) => setFormData({...formData, dailyCalories: e.target.value})} placeholder="Kcal" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="number" value={formData.protein} onChange={(e) => setFormData({...formData, protein: e.target.value})} placeholder="P %" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="number" value={formData.carbs} onChange={(e) => setFormData({...formData, carbs: e.target.value})} placeholder="C %" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="number" value={formData.fat} onChange={(e) => setFormData({...formData, fat: e.target.value})} placeholder="F %" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>* Tổng phần trăm (P+C+F) phải bằng 100%</p>
            </div>

            <button type="submit" className="primary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem' }}>
              Tạo kế hoạch mới
            </button>
          </form>
        </div>
      )}

      {/* 3. EXISTING PLANS LIST */}
<h3 style={{ marginBottom: '20px' }}>Danh sách kế hoạch đã lưu</h3>
{isLoading ? (
  <p>Đang tải dữ liệu...</p>
) : (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
    {mealPlans?.map((plan: any) => {
      // Logic kiểm tra template đang hoạt động
      const isActive = plan.id === appliedPlanId;

      return (
        <div key={plan.id} className="card" style={{ 
          borderRadius: '18px', 
          padding: '20px', 
          transition: 'all 0.3s ease',
          cursor: 'default',
          border: isActive ? '2px solid #3b82f6' : '1px solid #edf2f7',
          backgroundColor: isActive ? '#f8faff' : 'white',
          boxShadow: isActive ? '0 8px 20px rgba(59, 130, 246, 0.1)' : 'none',
          position: 'relative'
        }}
        onMouseOver={(e) => { if(!isActive) e.currentTarget.style.transform = 'translateY(-5px)' }}
        onMouseOut={(e) => { if(!isActive) e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              zIndex: 5
            }}>
              ĐANG DÙNG 🎯
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: isActive ? '#1e3a8a' : '#2d3748' }}>{plan.name}</h4>
            
            {!isActive ? (
              <button 
                onClick={() => useTemplate(plan)}
                style={{ background: '#f0f9ff', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Dùng mẫu này
              </button>
            ) : (
              <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Đang áp dụng</span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
            📅 {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isActive ? '#2563eb' : '#4CAF50' }}>
                {plan.dailyCalories} <small style={{fontSize: '0.7rem'}}>kcal/ngày</small>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#A0AEC0', marginTop: '4px' }}>
                P: {plan.dailyMacros.protein}g | C: {plan.dailyMacros.carbs}g | F: {plan.dailyMacros.fat}g
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleEditClick(plan)}
                style={{ background: '#fef3c7', color: '#d97706', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Chỉnh sửa"
              >
                ✏️
              </button>
              
              {/* FIX: Chặn xóa nếu đang dùng */}
              <button 
                onClick={() => { 
                  if (isActive) {
                    alert('Không thể xóa kế hoạch đang được sử dụng. Vui lòng quay lại mức khuyến nghị hoặc đổi kế hoạch trước!');
                    return;
                  }
                  if(window.confirm('Bạn có chắc muốn xóa template này?')) deletePlan.mutate(plan.id) 
                }}
                style={{ 
                  background: isActive ? '#f1f5f9' : '#fee2e2', 
                  color: isActive ? '#94a3b8' : '#dc2626', 
                  border: 'none', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  cursor: isActive ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
                title={isActive ? "Đang dùng, không thể xóa" : "Xóa"}
              >
                🗑️
              </button>
            </div>
          </div>
          
          <MacroBar p={plan.dailyMacros.protein} c={plan.dailyMacros.carbs} f={plan.dailyMacros.fat} />
        </div>
      );
    })}
    
    {(!mealPlans || mealPlans.length === 0) && (
      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', backgroundColor: '#f9fafb', borderRadius: '20px', border: '2px dashed #e5e7eb' }}>
        <p style={{ color: '#9ca3af' }}>Chưa có kế hoạch nào được tạo.</p>
      </div>
    )}
  </div>
)}
    </div>
  )
}