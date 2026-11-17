import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Home,
  Utensils,
  Flame,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Header = ({ user, handleLogout, cartCount }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kiểm tra phân quyền
  const isAdmin =
    user?.name === 'Minh Dược' ||
    ['admin', 'Admin', 'quan_tri'].includes(user?.role);

  const isStaff =
    !isAdmin &&
    ['staff', 'Staff', 'nhan_vien', 'Nhân viên', 'employee'].includes(user?.role);

  const isActive = (path) => location.pathname === path;

  // ================= GIAO DIỆN HEADER DÀNH RIÊNG CHO ADMIN (CHỦ QUÁN) =================
  if (isAdmin) {
    return (
      <header className="bg-slate-900/95 backdrop-blur-md text-white px-4 md:px-8 py-3.5 shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin" className="flex items-center space-x-3.5 group">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
                RETASTE ADMIN
              </span>
              <p className="text-xs text-slate-400 font-medium">Hệ thống Quản trị Nhà hàng & POS</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 md:space-x-4">
            <Link
              to="/menu"
              className="hidden sm:flex items-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition"
            >
              <Utensils className="w-3.5 h-3.5 mr-1.5 text-orange-400" /> Xem Thực đơn
            </Link>

            <div className="hidden md:flex items-center bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <span className="ml-2.5 text-[11px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-orange-500/30">
                Chủ quán
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-red-600/20 transition duration-200"
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
    <header className="bg-white/90 backdrop-blur-md text-slate-800 sticky top-0 z-50 border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:rotate-6 transition duration-300">
            <Flame className="w-6 h-6 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent leading-none">
              RETASTE
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mt-0.5">
              Smart Food & Drink
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {!isStaff && (
            <>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  isActive('/')
                    ? 'bg-orange-50 text-primary'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <Home className="w-4 h-4 mr-1.5" /> Trang chủ
              </Link>
              <Link
                to="/menu"
                className={`flex items-center px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  isActive('/menu')
                    ? 'bg-orange-50 text-primary'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <Utensils className="w-4 h-4 mr-1.5" /> Thực đơn
              </Link>
              <Link
                to="/cart"
                className={`relative flex items-center px-4 py-2 rounded-xl font-bold text-sm transition ${
                  isActive('/cart')
                    ? 'bg-primary text-white shadow-md shadow-orange-500/25'
                    : 'bg-orange-50/80 text-primary hover:bg-orange-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span>Giỏ hàng</span>
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full font-extrabold ${
                    isActive('/cart')
                      ? 'bg-white text-primary'
                      : 'bg-primary text-white'
                  }`}
                >
                  {cartCount}
                </span>
              </Link>
            </>
          )}

          {isStaff && (
            <Link
              to="/admin"
              className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm transition ${
                isActive('/admin')
                  ? 'bg-primary text-white shadow-md shadow-orange-500/20'
                  : 'bg-orange-50 text-primary hover:bg-orange-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Bảng công việc (Nhân viên)
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2" />

          {user ? (
            <div className="flex items-center space-x-3 pl-1">
              <div className="flex items-center gap-2.5 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/70">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-amber-400 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                  {(user.name || 'U').charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                    {isStaff ? 'Nhân viên' : 'Khách hàng thân thiết'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200/80 hover:border-red-200 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition transform hover:-translate-y-0.5"
            >
              <User className="w-4 h-4 mr-1.5" /> Đăng nhập
            </Link>
          )}
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          {!isStaff && (
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-orange-50 text-primary font-bold"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-extrabold shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {!isStaff && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm ${
                  isActive('/') ? 'bg-orange-50 text-primary' : 'text-slate-700'
                }`}
              >
                <Home className="w-4 h-4 mr-2" /> Trang chủ
              </Link>
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm ${
                  isActive('/menu') ? 'bg-orange-50 text-primary' : 'text-slate-700'
                }`}
              >
                <Utensils className="w-4 h-4 mr-2" /> Thực đơn
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm ${
                  isActive('/cart') ? 'bg-orange-50 text-primary' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Giỏ hàng
                </span>
                <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {cartCount} món
                </span>
              </Link>
            </>
          )}

          {isStaff && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-2.5 rounded-xl font-bold text-sm bg-orange-50 text-primary"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" /> Quản lý (Nhân viên)
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                    {(user.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="bg-red-50 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center bg-primary text-white py-2.5 rounded-xl font-bold text-sm shadow"
              >
                <User className="w-4 h-4 mr-1.5" /> Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;