import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Home, Utensils, Flame, LayoutDashboard, User as UserIcon } from 'lucide-react';

const Header = ({ user, handleLogout, cartCount }) => {
  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-wider flex items-center">
          <Flame className="w-8 h-8 mr-2" /> RETASTE
        </Link>
        <nav className="flex space-x-6 items-center">
          <Link to="/" className="flex items-center font-medium hover:text-yellow-200 transition">
            <Home className="w-5 h-5 mr-1"/> Trang chủ
          </Link>
          <Link to="/menu" className="flex items-center font-medium hover:text-yellow-200 transition">
            <Utensils className="w-5 h-5 mr-1"/> Thực đơn
          </Link>
          
          <Link to="/cart" className="flex items-center font-bold text-yellow-200 hover:text-white transition">
            <ShoppingCart className="w-5 h-5 mr-1"/> Giỏ hàng ({cartCount})
          </Link>
          
          {/* Nút Admin ẩn, chỉ hiện nếu user là Minh Dược */}
          {user?.name === 'Minh Dược' && (
             <Link to="/admin" className="flex items-center font-medium hover:text-yellow-200 transition bg-orange-700 px-3 py-1 rounded-full">
               <LayoutDashboard className="w-4 h-4 mr-1"/> Admin
             </Link>
          )}
          
          {user ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-orange-400">
              <span className="font-bold flex items-center">
                <UserIcon className="w-5 h-5 mr-1"/> Chào, {user.name}
              </span>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow hover:bg-red-700 transition">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center font-medium hover:text-yellow-200 transition bg-white text-primary px-4 py-2 rounded-full shadow hover:bg-gray-100 ml-4">
              <User className="w-5 h-5 mr-1"/> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;