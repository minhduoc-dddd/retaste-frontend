import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import các Component
import Header from './components/Header';
import Footer from './components/Footer';

// Import các Trang
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function App() {
  // 1. LẤY TRẠNG THÁI USER TỪ LOCAL STORAGE (Nếu có)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('retaste_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState([]);

  // Kiểm tra quyền Admin và Nhân viên
  const isAdmin =
    user?.name === 'Minh Dược' ||
    ['admin', 'Admin', 'quan_tri'].includes(user?.role);

  const isStaff =
    !isAdmin &&
    ['staff', 'Staff', 'nhan_vien', 'Nhân viên', 'employee'].includes(user?.role);

  // 2. LƯU USER VÀO LOCAL STORAGE MỖI KHI CÓ THAY ĐỔI
  useEffect(() => {
    if (user) {
      localStorage.setItem('retaste_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('retaste_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    alert('Đã đăng xuất!');
  };

  // 3. CHẶN CẢ ADMIN VÀ NHÂN VIÊN THÊM MÓN VÀO GIỎ HÀNG
  const addToCart = (product) => {
    if (isAdmin || isStaff) {
      alert('Tài khoản Quản trị viên và Nhân viên chỉ dùng để quản lý hệ thống, không được phép thêm món vào giỏ hàng!');
      return;
    }

    setCart((prevCart) => {
      const productId = product._id || product.id;
      const existingItem = prevCart.find((item) => (item._id || item.id) === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    const productName = product.product_name || product.name;
    alert(`Đã thêm ${productName} vào giỏ hàng!`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if ((item._id || item.id) === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món này khỏi giỏ hàng?')) {
      setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== id));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header user={user} handleLogout={handleLogout} cartCount={cartItemCount} />

        <main className="flex-grow w-full py-8">
          <Routes>
            {/* Nếu là Admin vào trang chủ thì tự động điều hướng sang /admin */}
            <Route 
              path="/" 
              element={
                isAdmin ? <Navigate to="/admin" replace /> : <HomePage addToCart={addToCart} user={user} isStaff={isStaff} isAdmin={isAdmin} />
              } 
            />

            <Route path="/menu" element={<MenuPage addToCart={addToCart} user={user} isStaff={isStaff} isAdmin={isAdmin} />} />

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
                  />
                )
              }
            />

            <Route path="/login" element={<LoginPage setUser={setUser} />} />

            <Route
              path="/admin"
              element={
                isAdmin || isStaff ? (
                  <AdminPage user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;