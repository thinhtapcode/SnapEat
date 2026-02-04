import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary('week'),
  });

  if (isLoading) return <p>Loading insight...</p>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>Progress Analytics</h1>

      {/* Row 1: Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <div className="card" style={{ borderLeft: '5px solid #4CAF50' }}>
          <h4>Adherence</h4>
          <h2 style={{ color: '#4CAF50' }}>{analytics?.adherenceRate}%</h2>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #2196F3' }}>
          <h4>Avg. Calories</h4>
          <h2>{analytics?.averageCalories} <small>kcal</small></h2>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #FF9800' }}>
          <h4>Weight Diff</h4>
          <h2 style={{ color: analytics?.weightChange <= 0 ? '#4CAF50' : '#f44336' }}>
            {analytics?.weightChange > 0 ? '+' : ''}{analytics?.weightChange} kg
          </h2>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #9C27B0' }}>
          <h4>Prediction</h4>
          <h2>{analytics?.projectedWeight} <small>kg</small></h2>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Biểu đồ bám sát Calo */}
        <div className="card" style={{ height: '350px' }}>
          <h3>Calorie Adherence (Target vs Consumed)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={analytics?.chartData}>
              <defs>
                <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="consumed" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCons)" />
              <Line type="monotone" dataKey="target" stroke="#ff7300" strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cân nặng */}
        <div className="card" style={{ height: '350px' }}>
          <h3>Weight Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={analytics?.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="step" dataKey="weight" stroke="#2196F3" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Predictions & Insights */}
      <div className="card" style={{ background: '#f0f7ff', border: 'none' }}>
        <h3>🤖 AI Insights & Predictions</h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          Dựa trên dữ liệu 7 ngày qua, bạn đang thâm hụt trung bình <strong>300 kcal/ngày</strong>. 
          Nếu tiếp tục duy trì tỉ lệ bám plan <strong>{analytics?.adherenceRate}%</strong>, 
          bạn có thể đạt mục tiêu cân nặng vào ngày <strong>15/06/2024</strong>.
        </p>
      </div>
    </div>
  );
}