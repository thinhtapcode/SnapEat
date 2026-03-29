import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Thư viện để render Markdown
import { XOAI_GREETINGS } from '../assets/data/xoai-greeting';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  time?: string;
  isError?: boolean;
}

export default function BeXoai() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- LOGIC RANDOM LỜI CHÀO ---
    // Lấy ngẫu nhiên 1 câu từ mảng constants 
    const randomIndex = Math.floor(Math.random() * XOAI_GREETINGS.length);
    let randomText = XOAI_GREETINGS[randomIndex];

    setMessages([{
      role: 'model',
      text: randomText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. CHẶN SPAM: Nếu đang load hoặc input rỗng thì không làm gì cả
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true); // Set ngay lập tức

    // Thêm tin nhắn user vào UI
    const newMessage: ChatMessage = {
      role: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      const authData = localStorage.getItem('auth-storage');
      const token = authData ? JSON.parse(authData).state?.token : '';

      const response = await fetch('http://localhost:3000/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          // 2. TỐI ƯU: Chỉ gửi 6 câu gần nhất để tiết kiệm Quota
          history: messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
        })
      });

      // 3. XỬ LÝ LỖI QUOTA (429) CỤ THỂ
      if (response.status === 429) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: 'Hic, Xoài hết năng lượng rồi! Bạn đợi xíu (khoảng 1 phút) rồi hỏi lại Xoài nha. 🥭',
          isError: true
        }]);
        return;
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'model',
        text: data.reply || 'Xoài đang suy nghĩ chút...',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Kết nối với Xoài bị gián đoạn rồi. Kiểm tra lại mạng nhé! 🥭',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NÂNG CẤP STYLES ---
  const styles = {
    fab: {
      position: 'fixed' as const, bottom: '24px', right: '24px', width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: '#f97316', color: 'white', border: 'none', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)', zIndex: 9999,
    },
    chatWindow: {
      position: 'fixed' as const, bottom: '100px', right: '24px', width: '400px', height: '600px',
      backgroundColor: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column' as const,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 9999, border: '1px solid #eee',
      animation: 'fadeInUp 0.3s ease-out'
    },
    header: {
      padding: '16px 20px', background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
      color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    messageList: {
      flex: 1, padding: '20px', overflowY: 'auto' as const, backgroundColor: '#fdfdfd',
      display: 'flex', flexDirection: 'column' as const, gap: '16px'
    },
    bubbleUser: {
      alignSelf: 'flex-end', backgroundColor: '#f97316', color: 'white',
      padding: '12px 16px', borderRadius: '20px 20px 0 20px', maxWidth: '85%',
      fontSize: '14px', lineHeight: '1.5', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.15)'
    },
    bubbleModel: {
      alignSelf: 'flex-start', backgroundColor: '#f1f5f9', color: '#1e293b',
      padding: '12px 16px', borderRadius: '20px 20px 20px 0', maxWidth: '85%',
      fontSize: '14px', lineHeight: '1.6', border: '1px solid #e2e8f0'
    },
    loadingContainer: {
      display: 'flex', gap: '4px', padding: '12px 16px', backgroundColor: '#f1f5f9',
      borderRadius: '20px 20px 20px 0', width: 'fit-content'
    },
    dot: {
      width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%',
      animation: 'dotBounce 1.4s infinite ease-in-out'
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 
          0%, 80%, 100% { transform: scale(0); } 
          40% { transform: scale(1.0); } 
        }
        .markdown-content p { margin: 0; }
        .markdown-content strong { color: #f97316; font-weight: 700; }
        .markdown-content ul { padding-left: 20px; margin-top: 8px; }
      `}</style>

      {!isOpen && (
        <button style={styles.fab} onClick={() => setIsOpen(true)}>
          <Bot size={30} />
        </button>
      )}

      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '10px' }}>
                <Bot size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bé Xoài AI 🥭</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>TRỢ LÝ DINH DƯỠNG</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}>
              <X size={22} />
            </button>
          </div>

          <div style={styles.messageList}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleModel}>
                <div className="markdown-content">
                  {/* Render Markdown cực xịn ở đây */}
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '6px', textAlign: 'right' }}>{msg.time}</div>
              </div>
            ))}

            {isLoading && (
              <div style={styles.loadingContainer}>
                <div style={{ ...styles.dot, animationDelay: '0s' }}></div>
                <div style={{ ...styles.dot, animationDelay: '0.2s' }}></div>
                <div style={{ ...styles.dot, animationDelay: '0.4s' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', backgroundColor: 'white' }} onSubmit={handleSendMessage}>
            <input
              style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
              placeholder="Hỏi Xoài: 1 lạng ức gà bao nhiêu calo?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading} // Khóa nút khi đang load
              style={{
                backgroundColor: isLoading ? '#cbd5e1' : '#f97316', // Đổi màu xám khi bị khóa
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer', // Đổi trỏ chuột thành biển cấm
                display: 'flex',
                alignItems: 'center',
                opacity: isLoading ? 0.7 : 1, // Làm mờ nhẹ
                transition: 'all 0.2s ease' // Thêm hiệu ứng mượt mà
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}