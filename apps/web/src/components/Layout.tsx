import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, CalendarDays, BarChart3, User, Plus, Sparkles } from 'lucide-react' // Giữ nguyên icon Sparkles
import logo from '../assets/images/logo.svg'
import avatarPlaceholder from '../assets/images/avatar.svg'
import BeXoai from './BeXoai'

export default function Layout() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc'
    }}>
      {/* --- TOP BAR (Màu xanh lá đậm) --- */}
      <nav style={{
        background: 'rgba(19, 80, 43, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0.6rem 1rem', // Padding Mobile gọn gàng
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Logo & Brand (Bên trái) */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'white', zIndex: 10 }}>
            <img src={logo} alt="SnapEat Logo" style={{ height: '26px' }} />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>SnapEat</h2>
          </Link>

          {/* 🥭 MOBILE ONLY: Nút AI "Sparkles" ở GÓC PHẢI - Phong cách KÍNH MỜ */}
          <div className="mobile-only-header-xoai" style={{ display: 'none' }}>
            <button
              onClick={() => navigate('/xoai-chat')}
              className="ai-sparkle-button-glass"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.2)', // Đảm bảo viết trong dấu nháy đơn/kép
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)', // Hỗ trợ thêm cho Safari trên iPhone
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <Sparkles size={20} color="#f0f9ff" strokeWidth={2} />
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <NavLink to="/" active={isActive('/')} label="Chung" />
            <NavLink to="/meals" active={isActive('/meals')} label="Bữa ăn" />
            <NavLink to="/meal-plans" active={isActive('/meal-plans')} label="Kế hoạch" />
            <NavLink to="/analytics" active={isActive('/analytics')} label="Thống kê" />

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
              <img
                src={avatarPlaceholder}
                alt="Profile"
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #4ade80' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username}</span>
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, paddingBottom: '90px' }}>
        <div className="container" style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </main>

      {/* --- DESKTOP FAB (Sẽ bị ẩn ở Mobile qua CSS) --- */}
      <div className="desktop-fab-wrapper">
        <BeXoai />
      </div>

      {/* --- BOTTOM TAB BAR (Mobile) --- */}
      <div className="mobile-bottom-nav">
        <MobileTab to="/" active={isActive('/')} icon={<LayoutDashboard size={22} />} label="Chung" />
        <MobileTab to="/meal-plans" active={isActive('/meal-plans')} icon={<CalendarDays size={22} />} label="Kế hoạch" />

        <div className="fab-container">
          <Link to="/meals" style={{ textDecoration: 'none' }}>
            <div className="fab-button">
              <Plus size={28} color="white" strokeWidth={3} />
            </div>
          </Link>
        </div>

        <MobileTab to="/analytics" active={isActive('/analytics')} icon={<BarChart3 size={22} />} label="Thống kê" />
        <MobileTab to="/profile" active={isActive('/profile')} icon={<User size={22} />} label="Tôi" />
      </div>

      <style>{`
        /* Desktop Default Styles */
        .desktop-fab-wrapper { display: block; }
        .mobile-only-header-xoai { display: none; }

        @keyframes sparklePulse {
          0% { box-shadow: 0 0 0 0 rgba(224, 242, 254, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(224, 242, 254, 0); }
          100% { box-shadow: 0 0 0 0 rgba(224, 242, 254, 0); }
        }

        @media (max-width: 850px) {
          .desktop-nav { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          
          /* 1. Ẩn FAB tròn khi sang Mobile */
          .desktop-fab-wrapper { display: none !important; }

          /* 2. Hiện nút Chat trên Header Bar Mobile, đặt ở góc phải */
          .mobile-only-header-xoai { 
            display: block !important; 
            justify-self: flex-end; /* Đẩy sang góc phải */
            z-index: 5;
          }

          /* 3. Hiệu ứng active khi nhấn (kiểu kính) */
          .ai-sparkle-button-glass:active {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.25) !important; /* Đậm nền khi nhấn */
          }
          
          /* Bật hiệu ứng Pulse màu trắng ngọc trai */
          .ai-sparkle-button-glass {
            animation: sparklePulse 2s infinite;
          }

          main { padding-bottom: 100px !important; }
        }

        /* --- (Giữ nguyên CSS của Mobile Bottom Nav và FAB từ file gốc) --- */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          height: 75px;
          border-top: 1px solid #eee;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        }

        .fab-container { position: relative; top: -20px; }
        .fab-button {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4); border: 4px solid white;
          transition: 0.3s;
        }
      `}</style>
    </div>
  )
}

// ... (Giữ nguyên các hàm NavLink và MobileTab của bạn)
function NavLink({ to, active, label }: any) {
  return (
    <Link to={to} style={{
      color: 'white', textDecoration: 'none', fontWeight: 500,
      opacity: active ? 1 : 0.7, padding: '5px 10px',
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderRadius: '8px', transition: '0.3s'
    }}>
      {label}
    </Link>
  )
}

function MobileTab({ to, active, icon, label }: any) {
  return (
    <Link to={to} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textDecoration: 'none', gap: '2px', flex: 1,
      color: active ? '#166534' : '#94a3b8'
    }}>
      {icon}
      <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500' }}>{label}</span>
    </Link>
  )
}