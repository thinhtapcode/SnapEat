import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { analyticsApi } from '../services/api';

const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'];

// Style Card giữ nguyên "màu mè" của Thịnh nhưng tối ưu padding cho mobile
const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', 
  padding: 'clamp(16px, 4vw, 24px)', 
  borderRadius: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
  border: '1px solid #f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: 0 // Chống tràn trong flex/grid
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsApi.getDashboard
  });

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tính toán chỉ số sức khỏe...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(15px, 3vw, 30px)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 800, color: '#1e293b' }}> Phân tích dinh dưỡng</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Dữ liệu tổng hợp từ các bữa ăn của bạn</p>
      </header>

      {/* Grid thông minh: Tự rớt hàng khi không đủ 350px */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Chart 1: Calorie Variance */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>Calorie Thực tế vs Mục tiêu</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trends} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="actualCal" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Thực tế (kcal)" />
                <Bar dataKey="targetCal" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Mục tiêu (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Discipline Score */}
        <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>Chỉ số kỷ luật</h3>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10" 
                strokeDasharray={`${(data?.adherenceScore || 0) * 3.14}, 314`} transform="rotate(-90 60 60)" strokeLinecap="round" />
            </svg>
            <span style={{ position: 'absolute', fontSize: '24px', fontWeight: 800, color: '#065f46' }}>{data?.adherenceScore}%</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', textAlign: 'center' }}>
            Bạn đạt mục tiêu {data?.adherenceScore}% số ngày trong tuần.
          </p>
        </div>

        {/* Chart 3: Macro Trends */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>Biến thiên dinh dưỡng (g)</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area type="monotone" dataKey="protein" stroke="#3b82f6" fill="url(#colorProtein)" strokeWidth={3} name="Protein" />
                <Area type="monotone" dataKey="carbs" stroke="#f59e0b" fill="transparent" strokeWidth={3} name="Carbs" />
                <Area type="monotone" dataKey="fat" stroke="#ef4444" fill="transparent" strokeWidth={3} name="Fat" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Meal Distribution */}
        <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>Phân bổ Calo</h3>
            <div style={{
              display: 'flex', 
              flexWrap: 'wrap', // Mobile rớt hàng, Laptop dàn ngang
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '20px'
            }}>
                <div style={{ width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={data?.mealDistribution} 
                            dataKey="calories" 
                            nameKey="type" 
                            cx="50%" cy="50%" 
                            innerRadius={50} 
                            outerRadius={70} 
                            paddingAngle={5}
                          >
                              {data?.mealDistribution.map((_: any, i: number) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip />
                      </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    {data?.mealDistribution.map((d: any, i: number) => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #f8fafc', paddingBottom: '5px'}}>
                            <span><span style={{color: COLORS[i % COLORS.length], marginRight: '8px'}}>●</span>{d.type}</span>
                            <span style={{fontWeight: 700}}>{Math.round(d.calories)} kcal</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}