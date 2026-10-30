import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    if(window.confirm('Bạn có chắc muốn xóa món này khỏi giỏ hàng?')) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
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
            <Route path="/" element={<HomePage addToCart={addToCart} />} />
            <Route path="/menu" element={<MenuPage addToCart={addToCart} />} />
            
            {/* TRUYỀN THÊM USER VÀO CART PAGE ĐỂ LẤY THÔNG TIN ĐẶT HÀNG */}
            <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} clearCart={clearCart} user={user} />} />
            
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/admin" element={<AdminPage user={user} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;