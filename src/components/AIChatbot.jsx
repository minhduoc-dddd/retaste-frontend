import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Plus,
  ShoppingCart,
  Bot,
  MessageSquareHeart
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

const QUICK_PROMPTS = [
  '🍛 Gợi ý bữa ăn ngon dưới 70k',
  '👫 Đi 2 người có 120k nên gọi gì?',
  '🌧️ Món nào nóng hổi hoặc giòn ngon?',
  '🍑 Gợi ý đồ uống thanh mát giải nhiệt',
];

const AIChatbot = ({ addToCart, user, isAdmin, isStaff }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào ${
        user?.name || 'bạn'
      }! 👋 Mình là Trợ lý Ẩm thực AI của RETASTE. Bạn đang thèm hương vị gì hay muốn tìm combo theo ngân sách bao nhiêu để mình tư vấn ngay nhé!`,
      suggestedProducts: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Ẩn trợ lý đặt món đối với tài khoản Quản trị/Nhân viên
  if (isAdmin || isStaff) return null;

  const sendMessage = async (textToSend) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: trimmed,
        userName: user?.name || 'bạn',
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text:
          res.data?.reply ||
          'Mình tìm thấy một số món ngon rất hợp với khẩu vị của bạn dưới đây:',
        suggestedProducts: Array.isArray(res.data?.suggestedProducts)
          ? res.data.suggestedProducts
          : [],
        mode: res.data?.mode || 'ai',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Hiện tại kết nối tới máy chủ AI đang bận, bạn thử lại sau giây lát nhé!',
          suggestedProducts: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddComboToCart = (products) => {
    products.forEach((item) => {
      addToCart({
        _id: item._id,
        id: item._id,
        product_name: item.product_name,
        name: item.product_name,
        base_price: item.base_price,
        price: item.base_price,
        image_url: item.image_url || FALLBACK_FOOD_IMG,
        img: item.image_url || FALLBACK_FOOD_IMG,
      });
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {/* Cửa sổ Chat AI */}
      {isOpen && (
        <div className="mb-3 w-[350px] sm:w-[400px] max-h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-toast">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-wide">RETASTE AI</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Trợ lý tư vấn thực đơn & ngân sách thông minh
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nội dung hội thoại */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 max-h-[360px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-start gap-2 max-w-[90%]">
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white font-medium rounded-br-sm shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Danh sách món ăn được AI gợi ý kèm nút Thêm vào giỏ */}
                {msg.sender === 'ai' &&
                  Array.isArray(msg.suggestedProducts) &&
                  msg.suggestedProducts.length > 0 && (
                    <div className="mt-2.5 pl-9 w-full space-y-2">
                      {msg.suggestedProducts.map((item) => (
                        <div
                          key={item._id}
                          className="bg-white p-2.5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between gap-2.5 hover:border-blue-300 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.image_url || FALLBACK_FOOD_IMG}
                              alt={item.product_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_FOOD_IMG;
                              }}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-slate-800 truncate">
                                {item.product_name}
                              </p>
                              <p className="text-xs font-extrabold text-primary">
                                {Number(item.base_price || 0).toLocaleString('vi-VN')} đ
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              addToCart({
                                _id: item._id,
                                id: item._id,
                                product_name: item.product_name,
                                name: item.product_name,
                                base_price: item.base_price,
                                price: item.base_price,
                                image_url: item.image_url || FALLBACK_FOOD_IMG,
                                img: item.image_url || FALLBACK_FOOD_IMG,
                              })
                            }
                            className="bg-blue-50 hover:bg-primary text-primary hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm
                          </button>
                        </div>
                      ))}

                      {msg.suggestedProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddComboToCart(msg.suggestedProducts)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-primary to-blue-500 hover:from-blue-600 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            Thêm cả {msg.suggestedProducts.length} món vào giỏ (
                            {msg.suggestedProducts
                              .reduce((s, p) => s + (p.base_price || 0), 0)
                              .toLocaleString('vi-VN')}{' '}
                            đ)
                          </span>
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                <div className="w-6 h-6 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>RETASTE AI đang chọn món phù hợp cho bạn...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-[11px] font-semibold bg-blue-50/80 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap border border-blue-200/60 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI (VD: Có 100k ăn gì ngon?)..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white border border-transparent focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-primary hover:bg-blue-600 disabled:bg-slate-300 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Nút Mở/Đóng Chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-800 via-blue-700 to-amber-500 hover:from-blue-900 hover:to-amber-600 text-white px-4 py-3.5 rounded-full shadow-glow transition transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <MessageSquareHeart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
        </div>
        <span className="font-extrabold text-sm pr-1">
          {isOpen ? 'Thu gọn AI' : 'Trợ lý Ẩm thực AI'}
        </span>
      </button>
    </div>
  );
};

export default AIChatbot;
