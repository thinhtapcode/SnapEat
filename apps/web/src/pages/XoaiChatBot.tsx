import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { XOAI_GREETINGS } from '../assets/data/xoai-greeting';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    time?: string;
    isError?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function XoaiChatPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * XOAI_GREETINGS.length);
        const randomText = XOAI_GREETINGS[randomIndex];

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
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setIsLoading(true);

        const newMessage: ChatMessage = {
            role: 'user',
            text: userMsg,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);

        try {
            const authData = localStorage.getItem('auth-storage');
            const token = authData ? JSON.parse(authData).state?.token : '';

            const response = await fetch(`${API_URL}/chatbot/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
                })
            });

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

    const styles = {
        wrapper: {
            // 🔥 CHIÊU CUỐI: Cố định toàn màn hình, đè lên Layout tổng
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000, // Đảm bảo đè lên cả navbar của Layout
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
        },
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            height: '100%', // Ăn theo chiều cao của wrapper (100vh)
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'white',
            boxShadow: '0 0 40px rgba(0,0,0,0.1)',
            overflow: 'hidden', // ⚡ QUAN TRỌNG: Không cho container tổng cuộn
        },
        header: {
            flexShrink: 0, // ⚡ KHÔNG cho header bị co lại
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        messageList: {
            flex: 1, // ⚡ CHIẾM toàn bộ khoảng trống còn lại
            padding: '20px 16px',
            overflowY: 'auto' as const, // 🔥 CHỈ cho phép cuộn ở đây
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
            WebkitOverflowScrolling: 'touch' as const, // Cuộn mượt trên iPhone
        },
        inputArea: {
            flexShrink: 0, // ⚡ KHÔNG cho input area bị co lại
            padding: '16px',
            backgroundColor: 'white',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            // Tránh bị thanh điều hướng của iOS che mất
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <style>{`
                    /* Ẩn thanh cuộn để nhìn cho sạch (tùy chọn) */
                    .message-list::-webkit-scrollbar { width: 4px; }
                    .message-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    
                    .markdown-content p { margin: 0; }
                    .markdown-content strong { color: #22c55e; font-weight: 700; }
                    @keyframes dotBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
                `}</style>

                {/* --- Header (Cố định đầu) --- */}
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
                        <Bot size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '16px' }}>Bé Xoài AI 🥭</div>
                        <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
                            Đang trực tuyến
                        </div>
                    </div>
                </div>

                {/* --- Danh sách tin nhắn (Vùng duy nhất được cuộn) --- */}
                <div style={styles.messageList} className="message-list">
                    {messages.map((msg, i) => (
                        <div key={i} style={msg.role === 'user' ? bubbleUserStyle : bubbleModelStyle}>
                            <div className="markdown-content">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '6px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                        </div>
                    ))}
                    {isLoading && (
                        <div style={bubbleModelStyle}>
                            <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                                {[0, 0.2, 0.4].map((delay) => (
                                    <div key={delay} style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%', animation: `dotBounce 1.4s infinite ease-in-out ${delay}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* --- Input Area (Cố định đáy) --- */}
                <form style={styles.inputArea} onSubmit={handleSendMessage}>
                    <input
                        style={{ flex: 1, padding: '12px 18px', borderRadius: '25px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc' }}
                        placeholder="Hỏi Xoài bất cứ điều gì..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading ? '#cbd5e1' : '#f97316',
                            color: 'white',
                            border: 'none',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

// Tách style bubble ra ngoài cho gọn code return
const bubbleUserStyle = {
    alignSelf: 'flex-end' as const,
    backgroundColor: '#f97316',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '85%',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.1)'
};

const bubbleModelStyle = {
    alignSelf: 'flex-start' as const,
    backgroundColor: 'white',
    color: '#1e293b',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    maxWidth: '85%',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};