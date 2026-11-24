import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Flame, ShieldCheck, Briefcase } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

const LoginPage = ({ setUser, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
          email,
          password,
        });

        setUser(res.data.user);
        showToast?.(`Chào mừng ${res.data.user.name} quay trở lại!`, 'success');
        if (['admin', 'Admin', 'quan_tri', 'nhan_vien', 'staff'].includes(res.data.user?.role)) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        if (!username || !email || !password) {
          showToast?.('Vui lòng nhập đầy đủ thông tin!', 'error');
          setIsLoading(false);
          return;
        }

        await axios.post(`${API_BASE_URL}/api/users/register`, {
          full_name: username,
          email,
          password,
          phone_number: phoneNumber,
        });

        showToast?.('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      showToast?.(
        error.response?.data?.message || 'Có lỗi xảy ra khi kết nối với máy chủ!',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng nhập nhanh cho Admin & Nhân viên phục vụ Demo
  const handleQuickDemoLogin = (roleType) => {
    if (roleType === 'admin') {
      setUser({
        id: '65f0a1b2c3d4e5f6a7b8c9d0',
        name: 'Minh Dược',
        email: 'dominhduoc283@gmail.com',
        role: 'admin',
      });
      showToast?.('Đã đăng nhập nhanh quyền Quản trị viên (Admin)!', 'success');
      navigate('/admin');
    } else if (roleType === 'staff') {
      setUser({
        id: '65f0a1b2c3d4e5f6a7b8c9d1',
        name: 'Phi Long (Nhân viên)',
        email: 'philong.staff@retaste.vn',
        role: 'nhan_vien',
      });
      showToast?.('Đã đăng nhập nhanh quyền Nhân viên!', 'success');
      navigate('/admin');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-6">
      <div className="bg-white rounded-3xl shadow-soft border border-slate-200/80 w-full max-w-md overflow-hidden">
        {/* Top Accent Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-7 text-center text-white relative overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isLogin ? 'Chào mừng trở lại RETASTE' : 'Tạo tài khoản thành viên'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isLogin
              ? 'Đăng nhập để nhận gợi ý món ngon đúng sở thích của bạn'
              : 'Đăng ký nhanh để đặt món và lưu lịch sử ẩm thực'}
          </p>
        </div>

        <div className="p-7">
          {/* Tabs chuyển đổi Đăng nhập / Đăng ký */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2 text-sm font-bold rounded-xl transition ${
                isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2 text-sm font-bold rounded-xl transition ${
                !isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên của bạn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="Số điện thoại (Tùy chọn)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                required
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20 ${
                isLoading ? 'bg-slate-400' : 'bg-primary hover:bg-blue-600 active:scale-[0.99]'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập ngay' : 'Hoàn tất Đăng ký'}
            </button>
          </form>

          {/* Khu vực Demo nhanh cho Hội đồng chấm đồ án */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Đăng nhập nhanh phục vụ Demo Đồ án
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex items-center justify-center gap-1.5 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold py-2.5 px-3 rounded-xl transition"
              >
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                className="flex items-center justify-center gap-1.5 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold py-2.5 px-3 rounded-xl transition"
              >
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Demo Nhân viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;