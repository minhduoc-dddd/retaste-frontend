import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const LoginPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Dùng làm full_name khi đăng ký
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // GỌI API ĐĂNG NHẬP
        const res = await axios.post('http://localhost:5000/api/users/login', {
          email,
          password
        });
        
        alert('Đăng nhập thành công!');
        setUser(res.data.user); // Gán thông tin user vào biến toàn cục của App.jsx
        navigate('/');
        
      } else {
        // GỌI API ĐĂNG KÝ
        if (!username || !email || !password) {
          alert('Vui lòng nhập đầy đủ thông tin!');
          setIsLoading(false);
          return;
        }
        
        await axios.post('http://localhost:5000/api/users/register', {
          full_name: username,
          email,
          password
        });
        
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true); // Chuyển sang form đăng nhập
        setPassword(''); // Xóa trắng ô password
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra kết nối với máy chủ!');
    }
    
    setIsLoading(false);
  };

  // Nút này vẫn giữ để Demo đăng nhập nhanh cho Minh Dược (Admin)
  const handleGmailLogin = () => {
    setUser({ 
      id: '65f0a1b2c3d4e5f6a7b8c9d0', // BỔ SUNG DÒNG NÀY: ID giả lập chuẩn MongoDB
      name: 'Minh Dược', 
      email: 'dominhduoc283@gmail.com', 
      role: 'admin' 
    });
    alert('Đăng nhập nhanh bằng tài khoản nội bộ thành công!');
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 text-primary">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Họ và tên" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input type="password" required placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          
          <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg ${isLoading ? 'bg-gray-400' : 'bg-primary hover:bg-orange-600'}`}>
            {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative flex items-center justify-center w-full border-t border-gray-300 mb-6">
            <span className="absolute bg-white px-3 text-gray-500 text-sm">Hoặc</span>
          </div>
          <button type="button" onClick={handleGmailLogin} className="w-full flex items-center justify-center border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" /> Đăng nhập nhanh tài khoản (Admin)
          </button>
        </div>
        
        <div className="mt-6 text-center text-gray-600">
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline focus:outline-none">
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;