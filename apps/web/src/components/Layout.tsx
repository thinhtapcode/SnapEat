import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import logo from '../assets/images/logo.svg';

export default function Layout() {
  const { user, logout } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{
        background: '#192905',
        padding: '1rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="SnapEat Logo" style={{ height: '45px', width: 'auto' }} />
          <h1 style={{ margin: 0 }}>SnapEat</h1>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/meals" style={{ color: 'white', textDecoration: 'none' }}>Meals</Link>
          <Link to="/meal-plans" style={{ color: 'white', textDecoration: 'none' }}>Meal Plans</Link>
          <Link to="/analytics" style={{ color: 'white', textDecoration: 'none' }}>Analytics</Link>
          <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>
          <img
            src={"../src/assets/images/avatar.svg"} // Placeholder nếu không có ảnh
            alt={user?.username}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
          />
          <button onClick={logout} style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </div>
  )
}
