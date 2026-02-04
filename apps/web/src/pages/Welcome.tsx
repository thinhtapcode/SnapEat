import React from "react";

export default function Welcome() {
  return (
    <div style={{ position: "relative", width: "100%", backgroundColor: "#1a2417" }}>
      
      {/* 1. NAVBAR (Giữ nguyên như cũ) */}
      <nav style={navBarStyle}>
        <a href="#home" style={logoContainerStyle}>
          <img src="../src/assets/images/logo_text.svg" alt="Logo" style={{ height: "70px" }} />
        </a>

        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <a href="#home" style={navLinkStyle}>Get Start</a>
          <a href="#about" style={navLinkStyle}>About</a>
          <a href="#contact" style={navLinkStyle}>Contact</a>
          <div style={{ marginLeft: "20px", display: "flex", gap: "10px" }}>
            <a href="/login" style={navBtnStyle(true)}>Login</a>
            <a href="/register" style={navBtnStyle(false)}>Register</a>
          </div>
        </div>
      </nav>

      {/* 2. BACKGROUND IMAGE (Lớp dưới) */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 1 }}>
        <img src="../src/assets/images/welcome_bg.svg" alt="Background" style={{ width: "100%", display: "block" }} />
      </div>

      {/* 3. NỘI DUNG CÁC SECTION (Lớp trên) */}
      <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* SECTION HOME: Nơi chứa Get Start và 2 nút Login/Register */}
        <section id="home" style={homeSectionStyle}>
          <div style={homeContentWrapper}>
            <h1 style={heroTitleStyle}>Get start and <br /> discovery <br /> SnapEat with us</h1>
            <p style={heroSubTitleStyle}>Snap. Analyze. Nourish.</p>
            
            <div style={heroActionContainer}>
              <a href="/login" style={heroBtnStyle(true)}>Login</a>
              <a href="/register" style={heroBtnStyle(false)}>Register</a>
            </div>
          </div>
        </section>

        {/* SECTION ABOUT */}
        <section id="about" style={sectionAboutStyle}>
            {/* Chữ sẽ tự động đè lên phần About của background */}
            <div style={{ maxWidth: "500px" }}>
                <h2 style={{...titleStyle, textAlign: "right"}}>About Us</h2>
                <p style={{ ...textStyle, textAlign: "right" }}>
                    SnapEat: Your Personal Nutritionist in a Snap. 
                    <br /><br />We believe that nutrition shouldn't be a guessing game, but a personalized experience that fits your unique lifestyle.
                    <br/><br />From logging your daily meals and crafting calorie-macro plans to deep nutrition analysis and long-term progress tracking — every feature is designed to be intuitive, visual, and deeply personalized.
                    <br /><br />With subtle AI integration, SnapEat does more than just keep you on track. We provide the right insights and gentle guidance, empowering you to make sustainable progress at your own pace, in your own way.

                </p>
            </div>
        </section>

        {/* SECTION CONTACT */}
        <section id="contact" style={sectionContactStyle}>
          <h2 style={titleStyle}>Contact</h2>
          <p style={textStyle}>Email: thinh.buianh@hcmut.edu.vn</p>
          <p style={textStyle}>Hotline: +84 703 542 104</p>
        </section>
      </div>
    </div>
  );
}

// --- HỆ THỐNG STYLE ĐỂ CĂN CHỈNH ---

const navBarStyle = {
  position: "fixed", top: 0, width: "100%", display: "flex",
  justifyContent: "space-between", alignItems: "center",
  padding: "15px 60px", zIndex: 100, boxSizing: "border-box",
  background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)"
};

const logoContainerStyle = { display: "flex", alignItems: "center", textDecoration: "none" };

const homeSectionStyle = {
  height: "100vh",
  display: "flex",
  alignItems: "center", // Căn giữa theo chiều dọc
  paddingLeft: "10%",  // Đẩy nội dung sang phải một chút để khớp với thiết kế
};

const homeContentWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const heroTitleStyle = {
  fontSize: "4rem",
  fontWeight: "bold",
  color: "#fff",
  lineHeight: "1.1",
  margin: 0,
};

const heroSubTitleStyle = {
  fontSize: "1.2rem",
  color: "#cfffd0",
  margin: "0 0 20px 0",
};

const heroActionContainer = {
  display: "flex",
  gap: "20px",
};

const heroBtnStyle = (isSolid) => ({
  padding: "1rem 2.5rem",
  backgroundColor: isSolid ? "#cfffd0ab" : "transparent",
  color: "white",
  border: "1px solid #cfffd0",
  borderRadius: "35px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  minWidth: "140px",
  transition: "0.3s",
});

const sectionAboutStyle = {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end", // Đẩy nội dung sang phải để né hình điện thoại trong nền
    paddingRight: "10%",
    paddingTop: "150px",
};

const sectionContactStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "10%",
};

// Reusable styles
const navLinkStyle = { textDecoration: "none", color: "#fff", fontWeight: "500" };
const navBtnStyle = (isLogin) => ({
    textDecoration: "none", color: "#fff", padding: "8px 20px",
    borderRadius: "20px", border: "1px solid #cfffd0",
    backgroundColor: isLogin ? "#4a7c44" : "transparent", fontWeight: "bold"
});
const titleStyle = { fontSize: "3.5rem", color: "#cfffd0", marginBottom: "20px" };
const textStyle = { color: "#eee", fontSize: "1.1rem", lineHeight: "1.8", maxWidth: "600px" };