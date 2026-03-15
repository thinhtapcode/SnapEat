import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // Cần cài lucide-react để làm menu mobile
import logoText from '../assets/images/logo_text.svg'; // Logo dạng text cho navbar
import welcomeBg from '../assets/images/welcome_bg.svg'; // Background chính cho trang Welcome

export default function Welcome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="welcome-wrapper">
      
      {/* 1. NAVBAR (Responsive) */}
      <nav className={`navbar ${isMenuOpen ? 'mobile-open' : ''}`}>
        <a href="#home" className="logo-container">
          <img src={logoText} alt="Logo" className="logo-img" />
        </a>

        {/* Hamburger Menu cho Mobile */}
        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X color="white" /> : <Menu color="white" />}
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home" onClick={() => setIsMenuOpen(false)}>Get Start</a>
          <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <div className="nav-auth-btns">
            <a href="/login" className="nav-btn login">Login</a>
            <a href="/register" className="nav-btn register">Register</a>
          </div>
        </div>
      </nav>

      {/* 2. BACKGROUND (Lớp nền cố định hoặc theo scroll) */}
      <div className="main-bg-layer" style={{ backgroundImage: `url(${welcomeBg})` }}></div>

      {/* 3. NỘI DUNG CÁC SECTION */}
      <div className="content-layer">
        
        <section id="home" className="section hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Get start and <br /> discovery <br /> SnapEat with us</h1>
            <p className="hero-subtitle">Snap. Analyze. Nourish.</p>
            <div className="hero-actions">
              <a href="/login" className="hero-btn solid">Login</a>
              <a href="/register" className="hero-btn outline">Register</a>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="about-content">
            <h2 className="section-title">About Us</h2>
            <p className="section-text">
              SnapEat: Your Personal Nutritionist in a Snap. 
              <br /><br />We believe that nutrition shouldn't be a guessing game, but a personalized experience that fits your unique lifestyle.
              <br/><br />From logging your daily meals and crafting calorie-macro plans to deep nutrition analysis.
            </p>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <h2 className="section-title">Contact</h2>
          <div className="contact-info">
            <p className="section-text">Email: thinh.buianh@hcmut.edu.vn</p>
            <p className="section-text">Hotline: +84 703 542 104</p>
          </div>
        </section>
      </div>

      <style>{`
        /* Global & Layout */
        .welcome-wrapper { 
          position: relative; 
          width: 100%; 
          background-color: #1a2417; 
          overflow-x: hidden;
        }

        /* Navbar Styling */
        .navbar {
          position: fixed; top: 0; width: 100%; display: flex;
          justify-content: space-between; alignItems: center;
          padding: 10px 5%; z-index: 1000; box-sizing: border-box;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          transition: 0.3s;
        }
        .logo-img { height: 50px; }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-links a { text-decoration: none; color: #fff; font-weight: 500; }
        .nav-auth-btns { display: flex; gap: 10px; margin-left: 20px; }
        .nav-btn { 
          padding: 8px 20px; border-radius: 20px; border: 1.5px solid #cfffd0;
          font-weight: bold; text-decoration: none; color: white;
        }
        .nav-btn.login { background: #4a7c44; border-color: #4a7c44; }

        /* Background Layer */
        .main-bg-layer {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          background: url("../src/assets/images/welcome_bg.svg") no-repeat center center;
          background-size: cover;
          z-index: 1;
        }

        /* Section Commons */
        .content-layer { position: relative; z-index: 2; }
        .section { 
          min-height: 100vh; display: flex; flex-direction: column; 
          justify-content: center; padding: 0 10%; box-sizing: border-box;
        }

        /* Hero Styling */
        .hero-title { font-size: clamp(2.5rem, 8vw, 4.5rem); color: #fff; line-height: 1.1; margin: 0; font-weight: 900; }
        .hero-subtitle { font-size: 1.2rem; color: #cfffd0; margin: 20px 0 30px; }
        .hero-actions { display: flex; gap: 15px; }
        .hero-btn { 
          padding: 14px 30px; border-radius: 35px; font-weight: bold; 
          text-decoration: none; min-width: 120px; text-align: center;
          border: 1.5px solid #cfffd0; transition: 0.3s;
        }
        .hero-btn.solid { background: #cfffd0ab; color: white; }
        .hero-btn.outline { color: white; }

        /* About & Contact */
        .about-section { align-items: flex-end; text-align: right; }
        .about-content { max-width: 500px; }
        .section-title { fontSize: clamp(2rem, 6vw, 3.5rem); color: #cfffd0; margin-bottom: 20px; }
        .section-text { color: #eee; font-size: 1.1rem; line-height: 1.6; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .menu-icon { display: block; cursor: pointer; z-index: 1001; }
          .navbar { padding: 15px 20px; }
          
          .nav-links {
            position: fixed; top: 0; right: -100%; width: 80%; height: 100vh;
            background: #1a2417; flex-direction: column; justify-content: center;
            transition: 0.4s; box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          }
          .nav-links.active { right: 0; }
          .nav-auth-btns { flex-direction: column; width: 80%; margin: 30px 0 0 0; }
          .nav-btn { text-align: center; }

          .section { padding: 0 24px; align-items: center !important; text-align: center !important; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-btn { width: 100%; box-sizing: border-box; }
          
          /* Cho background lặp lại hoặc cố định linh hoạt hơn trên mobile */
          .main-bg-layer { background-position: 35% center; } 
        }

        @media (min-width: 769px) {
          .menu-icon { display: none; }
        }
      `}</style>
    </div>
  );
}