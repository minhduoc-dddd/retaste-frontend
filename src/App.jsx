import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// Import các Component
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';

// Import các Trang
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function App() {
  // 1. LẤY TRẠNG THÁI USER TỪ LOCAL STORAGE (Nếu có)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('retaste_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // 2. LẤY TRẠNG THÁI GIỎ HÀNG TỪ LOCAL STORAGE
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('retaste_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // 3. HỆ THỐNG THÔNG BÁO TOAST HIỆN ĐẠI
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Kiểm tra quyền Admin và Nhân viên
  const isAdmin =
    user?.name === 'Minh Dược' ||
    ['admin', 'Admin', 'quan_tri'].includes(user?.role);

  const isStaff =
    !isAdmin &&
    ['staff', 'Staff', 'nhan_vien', 'Nhân viên', 'employee'].includes(user?.role);

  // LƯU USER VÀO LOCAL STORAGE MỖI KHI CÓ THAY ĐỔI
  useEffect(() => {
    if (user) {
      localStorage.setItem('retaste_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('retaste_user');
    }
  }, [user]);

  // LƯU GIỎ HÀNG VÀO LOCAL STORAGE MỖI KHI CÓ THAY ĐỔI
  useEffect(() => {
    localStorage.setItem('retaste_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    setUser(null);
    showToast('Đã đăng xuất khỏi tài khoản!', 'info');
  };

  // CHẶN CẢ ADMIN VÀ NHÂN VIÊN THÊM MÓN VÀO GIỎ HÀNG
  const addToCart = (product) => {
    if (isAdmin || isStaff) {
      showToast(
        'Tài khoản Quản trị viên và Nhân viên chỉ dùng để quản lý hệ thống, không đặt hàng!',
        'error'
      );
      return;
    }

    const productId = product._id || product.id;
    const productName = product.product_name || product.name || 'Món ăn';
    const productPrice = Number(product.base_price ?? product.price ?? 0);
    const productImg =
      product.image_url ||
      product.img ||
      product.image ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => (item._id || item.id) === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          _id: productId,
          id: productId,
          product_name: productName,
          name: productName,
          base_price: productPrice,
          price: productPrice,
          image_url: productImg,
          img: productImg,
          quantity: 1,
        },
      ];
    });

    showToast(`Đã thêm "${productName}" vào giỏ hàng!`, 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if ((item._id || item.id) === id) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    const target = cart.find((item) => (item._id || item.id) === id);
    setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== id));
    if (target) {
      showToast(`Đã xóa "${target.product_name || target.name}" khỏi giỏ hàng`, 'info');
    }
  };

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('retaste_cart');
  }, []);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <Header user={user} handleLogout={handleLogout} cartCount={cartItemCount} />

        {/* Hệ thống Toast Notification góc trên bên phải */}
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto animate-toast flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-lg border backdrop-blur-md transition-all ${
                t.type === 'error'
                  ? 'bg-red-950/90 text-white border-red-700/60'
                  : t.type === 'info'
                  ? 'bg-slate-900/90 text-white border-slate-700/60'
                  : 'bg-emerald-950/90 text-white border-emerald-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 text-sm font-medium">
                {t.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                ) : t.type === 'info' ? (
                  <Info className="w-5 h-5 text-sky-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-white/60 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <main className="flex-grow w-full py-6 md:py-10">
          <Routes>
            {/* Nếu là Admin vào trang chủ thì tự động điều hướng sang /admin */}
            <Route
              path="/"
              element={
                isAdmin ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <HomePage
                    addToCart={addToCart}
                    user={user}
                    isStaff={isStaff}
                    isAdmin={isAdmin}
                    showToast={showToast}
                  />
                )
              }
            />

            <Route
              path="/menu"
              element={
                <MenuPage
                  addToCart={addToCart}
                  user={user}
                  isStaff={isStaff}
                  isAdmin={isAdmin}
                  showToast={showToast}
                />
              }
            />

            {/* Nếu Admin hoặc Nhân viên truy cập /cart thì chuyển thẳng về trang Quản lý (/admin) */}
            <Route
              path="/cart"
              element={
                isAdmin || isStaff ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <CartPage
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    clearCart={clearCart}
                    user={user}
                    showToast={showToast}
                  />
                )
              }
            />

            <Route
              path="/login"
              element={<LoginPage setUser={setUser} showToast={showToast} />}
            />

            <Route
              path="/admin"
              element={
                isAdmin || isStaff ? (
                  <AdminPage user={user} showToast={showToast} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>

        <AIChatbot addToCart={addToCart} user={user} isAdmin={isAdmin} isStaff={isStaff} />

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;