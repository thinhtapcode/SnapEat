import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tdeeApi, userApi } from '../services/api'

export default function Profile() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', gender: 'male',
    height: '', weight: '', activityLevel: 'MODERATELY_ACTIVE', goal: 'MAINTAIN_WEIGHT',
  })

  const { data: tdeeData, isLoading } = useQuery({
    queryKey: ['tdee'],
    queryFn: tdeeApi.calculate,
  })

  useEffect(() => {
    if (tdeeData && tdeeData.profile) {
      const p = tdeeData.profile;
      setFormData({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        age: p.age?.toString() || '',
        gender: p.gender || 'male',
        height: p.height?.toString() || '',
        weight: p.weight?.toString() || '',
        activityLevel: p.activityLevel || 'MODERATELY_ACTIVE',
        goal: p.goal || 'MAINTAIN_WEIGHT',
      })
    }
  }, [tdeeData])

  // --- GIỮ NGUYÊN LOGIC TÍNH TOÁN ---
  const previewStats = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseInt(formData.age);
    if (!w || !h || !a) return null;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr = formData.gender === 'male' ? bmr + 5 : bmr - 161;

    const multipliers: Record<string, number> = {
      SEDENTARY: 1.2, LIGHTLY_ACTIVE: 1.375, MODERATELY_ACTIVE: 1.55, VERY_ACTIVE: 1.725, EXTRA_ACTIVE: 1.9,
    };
    const tdee = bmr * (multipliers[formData.activityLevel] || 1.2);

    const adjustments: Record<string, number> = {
      LOSE_WEIGHT: -500, MAINTAIN_WEIGHT: 0, GAIN_WEIGHT: 500, BUILD_MUSCLE: 300,
    };
    const finalCalories = tdee + (adjustments[formData.goal] || 0);

    return {
      calories: Math.round(finalCalories),
      bmr: Math.round(bmr),
      macros: {
        protein: Math.round((finalCalories * 0.3) / 4),
        carbs: Math.round((finalCalories * 0.4) / 4),
        fat: Math.round((finalCalories * 0.3) / 9),
      }
    };
  }, [formData]);

  const displayStats = isEditing ? previewStats : (tdeeData?.recommend);

  const updateProfile = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tdee'] })
      setIsEditing(false)
      alert('Cập nhật hồ sơ thành công! ✨')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
    })
  }

  const formatEnum = (text: string) => text ? text.replace(/_/g, ' ').toLowerCase() : '---'
  // 1. Định nghĩa từ điển tiếng Việt cho các Enum
const activityMap: Record<string, string> = {
  SEDENTARY: 'Ít vận động (Văn phòng)',
  LIGHTLY_ACTIVE: 'Vận động nhẹ (1-2 buổi/tuần)',
  MODERATELY_ACTIVE: 'Vận động vừa (3-5 buổi/tuần)',
  VERY_ACTIVE: 'Vận động nhiều (6-7 buổi/tuần)',
  EXTRA_ACTIVE: 'Vận động cực độ (VĐV)',
};

const goalMap: Record<string, string> = {
  LOSE_WEIGHT: 'Giảm cân (Cutting)',
  MAINTAIN_WEIGHT: 'Duy trì cân nặng',
  GAIN_WEIGHT: 'Tăng cân (Bulking)',
  BUILD_MUSCLE: 'Tăng cơ tập trung',
};
  if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '15px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Hồ sơ sức khỏe</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ 
            padding: '10px 24px', borderRadius: '12px', border: 'none', 
            background: '#13502b', color: 'white', fontWeight: 'bold', cursor: 'pointer' 
          }}>
            Chỉnh sửa
          </button>
        )}
      </header>

      <div className="profile-grid">
        {/* CỘT TRÁI: NHẬP LIỆU */}
        <div className="card" style={{ 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '24px', 
          padding: '24px', backgroundColor: '#fff', border: '1px solid #f1f5f9' 
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: '#334155' }}>Thông tin cá nhân</h3>
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="input-form-grid">
                <InputGroup label="Họ" value={formData.firstName} onChange={(v: any) => setFormData({...formData, firstName: v})} />
                <InputGroup label="Tên" value={formData.lastName} onChange={(v: any) => setFormData({...formData, lastName: v})} />
                <InputGroup label="Tuổi" type="number" value={formData.age} onChange={(v: any) => setFormData({...formData, age: v})} required />
                
                <div className="custom-input-group">
                  <label>Giới tính</label>
                  <select value={formData.gender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="male">Nam</option><option value="female">Nữ</option>
                  </select>
                </div>

                <InputGroup label="Chiều cao (cm)" type="number" value={formData.height} onChange={(v: any) => setFormData({...formData, height: v})} required />
                <InputGroup label="Cân nặng (kg)" type="number" value={formData.weight} onChange={(v: any) => setFormData({...formData, weight: v})} required />
                
                <div className="custom-input-group full-width">
                  <label>Mức độ hoạt động</label>
                  <select value={formData.activityLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, activityLevel: e.target.value })}>
                    <option value="SEDENTARY">Ít vận động (Văn phòng)</option>
                    <option value="LIGHTLY_ACTIVE">Vận động nhẹ (1-2 buổi/tuần)</option>
                    <option value="MODERATELY_ACTIVE">Vận động vừa (3-5 buổi/tuần)</option>
                    <option value="VERY_ACTIVE">Vận động nhiều (6-7 buổi/tuần)</option>
                    <option value="EXTRA_ACTIVE">Vận động cực độ (VĐV)</option>
                  </select>
                </div>

                <div className="custom-input-group full-width">
                  <label>Mục tiêu</label>
                  <select value={formData.goal} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, goal: e.target.value })}>
                    <option value="LOSE_WEIGHT">Giảm cân (Cutting)</option>
                    <option value="MAINTAIN_WEIGHT">Duy trì cân nặng</option>
                    <option value="GAIN_WEIGHT">Tăng cân (Bulking)</option>
                    <option value="BUILD_MUSCLE">Tăng cơ tập trung</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="save-btn" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Hủy</button>
              </div>
            </form>
          ) : (
            <div className="info-display-grid">
              <InfoRow label="Họ và tên" value={`${formData.firstName} ${formData.lastName}`} />
              <InfoRow label="Giới tính" value={formData.gender === 'male' ? 'Nam' : 'Nữ'} />
              <InfoRow label="Tuổi" value={formData.age} />
              <InfoRow label="Chiều cao" value={`${formData.height} cm`} />
              <InfoRow label="Cân nặng" value={`${formData.weight} kg`} />
              
              {/* Chỗ này dùng Mapping để hiện tiếng Việt */}
              <InfoRow 
                label="Hoạt động" 
                value={activityMap[formData.activityLevel] || '---'} 
              />
              
              <div style={{ gridColumn: 'span 2' }}>
                <InfoRow 
                  label="Mục tiêu" 
                  value={goalMap[formData.goal] || '---'} 
                />
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: KẾT QUẢ TDEE - Đã tách BMR và tinh gọn */}
        <div className="stats-card" style={{ 
          background: isEditing ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', borderRadius: '24px', padding: '30px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center'
        }}>
          {displayStats ? (
            <>
              <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.1rem', opacity: 0.8, fontWeight: 500 }}>
                {isEditing ? "Dự báo chỉ số " : "Chỉ số hiện tại của bạn"}
              </h3>

              <div style={{ margin: '25px 0' }}>
                {/* Chỉ số Calories chính - To và rõ nhất */}
                <h2 style={{ fontSize: 'clamp(3.5rem, 10vw, 4.5rem)', margin: 0, fontWeight: 900, lineHeight: 0.9 }}>
                  {displayStats.calories}
                </h2>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px', fontWeight: 600, letterSpacing: '1px' }}>
                  KCAL / NGÀY
                </div>

                {/* Phần BMR - Tách xuống hàng riêng, cực kỳ tinh gọn */}
                <div style={{ 
                  marginTop: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}></div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '0.5px' }}>
                    BMR (Lượng calo tối thiểu để duy trì sự sống)
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {displayStats.bmr || Math.round(tdeeData?.profile?.bmr || 0)} <small style={{fontSize: '0.8rem', fontWeight: 400, opacity: 0.8}}>kcal</small>
                  </span>
                </div>
              </div>
              
              {/* Macros Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <MacroBox label="Protein" value={displayStats.macros.protein} />
                <MacroBox label="Carbs" value={displayStats.macros.carbs} />
                <MacroBox label="Fat" value={displayStats.macros.fat} />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}><p>Đang chờ dữ liệu...</p></div>
          )}
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 25px;
        }

        .input-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .custom-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .custom-input-group.full-width { grid-column: span 2; }

        .custom-input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        .custom-input-group input, .custom-input-group select {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 1rem;
          outline: none;
          transition: 0.2s;
        }

        .custom-input-group input:focus, .custom-input-group select:focus {
          border-color: #13502b;
          box-shadow: 0 0 0 3px rgba(19, 80, 43, 0.1);
        }

        .info-display-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .save-btn {
          flex: 2; padding: 14px; border-radius: 12px; border: none;
          background: #13502b; color: white; font-weight: bold; cursor: pointer;
        }

        .cancel-btn {
          flex: 1; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;
          background: white; color: #64748b; font-weight: bold; cursor: pointer;
        }

        @media (max-width: 850px) {
          .profile-grid { grid-template-columns: 1fr; }
          .input-form-grid { grid-template-columns: 1fr; }
          .custom-input-group.full-width { grid-column: span 1; }
          .info-display-grid { grid-template-columns: 1fr; }
          .info-display-grid > div { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  )
}

// Component phụ cho gọn code
const InputGroup = ({ label, type = "text", value, onChange, ...props }: any) => (
  <div className="custom-input-group">
    <label>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  </div>
)

const MacroBox = ({ label, value }: any) => (
  <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 5px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px' }}>{label}</div>
    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{value}g</div>
  </div>
)

const InfoRow = ({ label, value }: any) => (
  <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>{label}</label>
    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{value || '---'}</span>
  </div>
)