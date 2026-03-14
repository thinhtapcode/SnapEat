import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span>Quét món ăn bằng AI</span>
          <X onClick={onClose} cursor="pointer" />
        </div>
        
        <div style={webcamWrapper}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }} // Luôn dùng camera sau
            style={webcamStyle}
          />
          {/* Khung căn chỉnh giúp người dùng đặt đĩa thức ăn vào giữa */}
          <div style={guideFrameStyle} />
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={btnSecondary}>Hủy</button>
          <button onClick={capture} style={btnPrimary}>
            <Camera size={20} /> Chụp ảnh
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles cho Camera ---
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const containerStyle: React.CSSProperties = { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' };
const headerStyle: React.CSSProperties = { padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.1)' };
const webcamWrapper: React.CSSProperties = { flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' };
const webcamStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const guideFrameStyle: React.CSSProperties = { position: 'absolute', width: '250px', height: '250px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '20px', boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)' };
const footerStyle: React.CSSProperties = { padding: '30px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(0,0,0,0.8)' };
const btnPrimary = { padding: '15px 30px', borderRadius: '30px', background: '#10b981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' };
const btnSecondary = { color: 'white', background: 'transparent', border: 'none' };

export default CameraScanner;