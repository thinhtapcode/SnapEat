import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react' 
import logo from '../assets/images/logo.svg'
import backgroundPic from '../assets/images/background.svg' 

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authApi.register(email, username, password)
      setAuth(data.accessToken, data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '70px', height: '70px', background: 'rgba(30, 41, 59, 0.05)', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <img 
              src={logo} 
              alt="SnapEat Logo" 
              className="register-logo-icon" 
            />
          </div>
          <h1 className="register-title">Tạo tài khoản mới</h1>
          <p className="register-subtitle">Bắt đầu hành trình dinh dưỡng cùng SnapEat</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="register-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tên người dùng</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="register-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="register-input"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="register-btn">
            {isLoading ? 'Đang khởi tạo...' : 'Đăng ký ngay'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>

      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url(${backgroundPic}) no-repeat 50% 20%;
          background-size: cover;
          padding: 16px;
          box-sizing: border-box;
          position: relative;
        }

        .register-card {
          width: 100%;
          max-width: 420px; 
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(15px) saturate(160%);
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.4);
          box-sizing: border-box;
          animation: slideIn 0.5s ease-out;
        }

        @media (max-width: 480px) {
          .register-card { padding: 32px 20px; border-radius: 24px; }
          .register-title { font-size: 1.5rem !important; }
        }

        .register-logo-icon {
          width: 40px; height: 40px; 
          filter: brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(1651%) hue-rotate(185deg) brightness(88%) contrast(97%);
        }

        .register-title { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }
        .register-subtitle { color: #475569; margin-top: 8px; font-weight: 500; font-size: 0.95rem; }

        .form-group { margin-bottom: 18px; width: 100%; }
        .form-label { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        .input-wrapper { position: relative; width: 100%; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        
        .register-input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .register-input:focus { outline: none; border-color: #1e293b; background: white; }

        .register-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: #1e293b;
          color: white;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s;
          margin-top: 10px;
        }
        .register-btn:active { transform: scale(0.98); }
        .register-btn:disabled { opacity: 0.7; }

        .error-message { 
          padding: 10px; background: #fee2e2; color: #dc2626; 
          border-radius: 8px; font-size: 0.85rem; text-align: center; margin-bottom: 15px; 
        }

        .login-link { text-align: center; margin-top: 24px; color: #475569; font-size: 0.9rem; }
        .login-link a { color: #1e293b; font-weight: 700; text-decoration: none; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}