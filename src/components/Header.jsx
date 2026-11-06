import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Home, Utensils, Flame, LayoutDashboard, ShieldAlert, LogOut } from 'lucide-react';

const Header = ({ user, handleLogout, cartCount }) => {
  // Kiểm tra phân quyền
  const isAdmin =
    user?.name === 'Minh Dược' ||
    ['admin', 'Admin', 'quan_tri'].includes(user?.role);

  const isStaff =
    !isAdmin &&
    ['staff', 'Staff', 'nhan_vien', 'Nhân viên', 'employee'].includes(user?.role);

  // ================= GIAO DIỆN HEADER DÀNH RIÊNG CHO ADMIN (CHỦ QUÁN) =================
  if (isAdmin) {
    return (
      <header className="bg-gray-900 text-white px-6 py-3.5 shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl flex items-center justify-center shadow-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                RETASTE MANAGEMENT
              </span>
              <p className="text-xs text-gray-400">Hệ thống Quản trị Tối cao</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-200">Xin chào, {user.name}</span>
              <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-red-500/30">
                Admin
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ================= GIAO DIỆN HEADER DÀNH CHO KHÁCH HÀNG & NHÂN VIÊN =================
  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-wider flex items-center">
          <Flame className="w-8 h-8 mr-2" /> RETASTE
        </Link>
        <nav className="flex space-x-6 items-center">
          {!isStaff && (
            <>
              <Link to="/" className="flex items-center font-medium hover:text-yellow-200 transition">
                <Home className="w-5 h-5 mr-1" /> Trang chủ
              </Link>
              <Link to="/menu" className="flex items-center font-medium hover:text-yellow-200 transition">
                <Utensils className="w-5 h-5 mr-1" /> Thực đơn
              </Link>
              <Link to="/cart" className="flex items-center font-bold text-yellow-200 hover:text-white transition">
                <ShoppingCart className="w-5 h-5 mr-1" /> Giỏ hàng ({cartCount})
              </Link>
            </>
          )}

          {isStaff && (
            <Link
              to="/admin"
              className="flex items-center font-medium hover:text-yellow-200 transition bg-orange-700 px-3 py-1 rounded-full"
            >
              <LayoutDashboard className="w-4 h-4 mr-1" /> Quản lý (Nhân viên)
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-orange-400">
              <span className="font-bold flex items-center">
                <User className="w-5 h-5 mr-1" /> Chào, {user.name}
                {isStaff && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-extrabold">
                    Nhân viên
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow hover:bg-red-700 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center font-medium hover:text-yellow-200 transition bg-white text-primary px-4 py-2 rounded-full shadow hover:bg-gray-100 ml-4"
            >
              <User className="w-5 h-5 mr-1" /> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;