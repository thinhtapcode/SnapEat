import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, ArrowRight } from 'lucide-react' 
import logo from '../assets/images/logo.svg' 

export default function Login() {
  const [email, setEmail] = useState('')
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
      const data = await authApi.login(email, password)
      setAuth(data.accessToken, data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Logo SnapEat ở đầu trang */}
          {/* Icon Logo mờ trong card - Nâng cấp để nó nổi bật hơn */}
        <div style={{
          width: '70px', height: '70px', background: 'rgba(30, 41, 59, 0.05)', // Nền xám than mờ nhạt
          borderRadius: '20px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 24px', position: 'relative'
        }}>
          <img 
            src={logo} 
            alt="Card Logo Icon" 
            className="login-logo-icon" // Class cho icon logo
          />
        </div>
          <h1 className="login-title">Đăng nhập để tiếp tục SnapEat</h1>
        </div>

        

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* ... Phần form input và nút bấm giữ nguyên như bản trước ... */}
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
                className="login-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>

      <style>{`
        /* Reset & Container */
        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url(../src/assets/images/background.svg) no-repeat 50% 20%;
          background-size: cover;
          padding: 16px;
          box-sizing: border-box;
          position: relative;
          overflow: 'hidden';
        }

        /* Hiệu ứng bóng trang trí mờ Slate */
        .login-container::before, .login-container::after {
          content: ''; position: absolute; border-radius: 50%; z-index: 0;
        }
        .login-container::before {
          width: 300px; height: 300px; background: #94a3b8;
          top: -100px; right: -100px; opacity: 0.1; filter: 'blur(70px)';
        }
        .login-container::after {
          width: 250px; height: 250px; background: #64748b;
          bottom: -50px; left: -50px; opacity: 0.08; filter: 'blur(60px)';
        }

        /* Card Glassmorphism */
        .login-card {
          width: 100%; max-width: 400px; 
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(15px) saturate(160%);
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.4);
          box-sizing: border-box;
          animation: slideIn 0.5s ease-out;
          z-index: 1; /* Đảm bảo card nằm trên bóng */
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card { padding: 32px 20px; border-radius: 24px; }
          .login-title { font-size: 1.5rem !important; }
        }

        /* LOGO STYLING - CHÌA KHÓA Ở ĐÂY */
        .header-logo {
          width: 64px; height: 64px; margin-bottom: 16px;
          /* FIX: Đổi màu từ trắng -> đen than (#1e293b) */
          filter: brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(1651%) hue-rotate(185deg) brightness(88%) contrast(97%);
        }

        .login-logo-icon {
          width: 40px; height: 40px; 
          /* FIX: Đổi màu từ trắng -> xám Slate trung tính (#475569) */
          filter: brightness(0) saturate(100%) invert(44%) sepia(13%) saturate(1059%) hue-rotate(185deg) brightness(97%) contrast(92%);
        }

        .login-title { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }
        .login-subtitle { color: #475569; margin-top: 8px; font-weight: 500; font-size: 0.95rem; }

        /* ... Phần Form và Link giữ nguyên như bản trước ... */
        .form-group { margin-bottom: 20px; width: 100%; }
        .form-label { display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        .input-wrapper { position: relative; width: 100%; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .login-input {
          width: 100%; padding: 12px 12px 12px 42px;
          border-radius: 12px; border: 1.5px solid #cbd5e1;
          background: rgba(255, 255, 255, 0.5); font-size: 1rem;
          box-sizing: border-box; transition: all 0.2s ease;
        }
        .login-input:focus { outline: none; border-color: #1e293b; background: white; }
        .login-btn {
          width: 100%; padding: 14px; border-radius: 12px;
          background: #1e293b; color: white; border: none;
          font-weight: 700; font-size: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: transform 0.2s, opacity 0.2s; margin-top: 8px;
        }
        .login-btn:active { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.7; }
        .error-message { 
          padding: 10px; background: #fee2e2; color: #dc2626; 
          border-radius: 8px; font-size: 0.85rem; text-align: center; margin-bottom: 15px; 
        }
        .register-link { text-align: center; margin-top: 24px; color: #475569; font-size: 0.9rem; }
        .register-link a { color: #1e293b; font-weight: 700; text-decoration: none; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}