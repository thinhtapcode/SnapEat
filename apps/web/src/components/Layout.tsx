import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, Utensils, CalendarDays, BarChart3, User, LogOut, Plus } from 'lucide-react'
import logo from '../assets/images/logo.svg'
import avatarPlaceholder from '../assets/images/avatar.svg'
import FloatingAddButton from './FAB'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc' 
    }}>
      {/* --- TOP BAR --- */}
      <nav style={{
        background: 'rgba(19, 80, 43, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0.6rem 1.5rem',
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
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'white' }}>
            <img src={logo} alt="SnapEat Logo" style={{ height: '32px' }} />
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>SnapEat</h2>
          </Link>

          {/* Desktop: Đã đổi chỗ Avatar và Logout */}
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
              <span style={{fontSize: '0.9rem', fontWeight: 500}}>{user?.username}</span>
            </Link>

            <button onClick={logout} className="logout-btn-desktop" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, paddingBottom: '90px' }}>
        <div className="container" style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </main>
      <div className="desktop-fab-wrapper">
        <FloatingAddButton />
      </div>

      {/* --- BOTTOM TAB BAR (Kết hợp nút FAB ở giữa) --- */}
      <div className="mobile-bottom-nav">
        <MobileTab to="/" active={isActive('/')} icon={<LayoutDashboard size={22} />} label="Chung" />
        <MobileTab to="/meal-plans" active={isActive('/meal-plans')} icon={<CalendarDays size={22} />} label="Kế hoạch" />
        
        {/* Nút FAB trung tâm tích hợp vào bar */}
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
        .logout-btn-desktop {
          background: transparent;
          color: #ff8a80;
          border: none;
          padding: 8px;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
        }
        .logout-btn-desktop:hover { color: #f44336; transform: scale(1.1); }

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

        .fab-container {
          position: relative;
          top: -20px; /* Đẩy nút lồi lên một chút cho bắt mắt */
        }

        .fab-button {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
          border: 4px solid white;
          transition: 0.3s;
        }
        .fab-button:active { transform: scale(0.9); }

        @media (max-width: 850px) {
          .desktop-nav { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
        /* Mặc định cho Desktop */
        .desktop-fab-wrapper {
          display: block; /* Hiện FAB ở Desktop */
        }

        @media (max-width: 850px) {
          .desktop-nav { 
            display: none !important; 
          }
          
          /* 1. ẨN nút FAB của desktop khi sang mobile */
          .desktop-fab-wrapper { 
            display: none !important; 
          }

          /* 2. HIỆN thanh bar mobile */
          .mobile-bottom-nav { 
            display: flex !important; 
          }

          /* 3. Đảm bảo main không bị thanh bar che mất nội dung cuối */
          main {
            padding-bottom: 100px !important;
          }
        }
      `}</style>
    </div>
  )
}

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