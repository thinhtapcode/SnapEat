import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{
        background: '#4CAF50',
        padding: '1rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0 }}>SnapEat</h1>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/meals" style={{ color: 'white', textDecoration: 'none' }}>Meals</Link>
          <Link to="/meal-plans" style={{ color: 'white', textDecoration: 'none' }}>Meal Plans</Link>
          <Link to="/analytics" style={{ color: 'white', textDecoration: 'none' }}>Analytics</Link>
          <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>
          <span>{user?.username}</span>
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
