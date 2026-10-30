import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';

// Bổ sung thêm props `user`
const CartPage = ({ cart, updateQuantity, removeItem, clearCart, user }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State tạm thời cho thông tin giao hàng
  const [phone, setPhone] = useState('0901234567');
  const [address, setAddress] = useState('Đại học Duy Tân, Đà Nẵng');

  const navigate = useNavigate(); 

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    // Yêu cầu phải đăng nhập mới được đặt hàng
    if (!user) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      navigate('/login');
      return;
    }

    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      // 1. Dùng dữ liệu thật của User đang đăng nhập
      const orderData = {
        user_id: user.id, // Lấy ID thật từ DB của khách hàng
        customer_info: {
          name: user.name, // Lấy tên thật
          phone: phone,
          address: address
        },
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: total
      };

      await axios.post('http://localhost:5000/api/orders', orderData);
      
      alert('🎉 Đặt hàng thành công! Cửa hàng đang chuẩn bị món cho bạn.');
      clearCart();
      navigate('/'); 
      
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert('❌ Có lỗi xảy ra khi đặt hàng. Vui lòng kiểm tra lại Server Backend!');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng của bạn đang trống</h2>
        <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg mt-4">
          Xem thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <ShoppingCart className="w-8 h-8 mr-3 text-primary" /> Giỏ hàng của bạn
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột Trái: Chi tiết món ăn */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center border border-gray-100">
              <img src={item.img} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                <p className="text-primary font-bold">{item.price.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 mx-4">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary"><Minus className="w-4 h-4"/></button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary"><Plus className="w-4 h-4"/></button>
              </div>
              <div className="text-right min-w-[100px]">
                <p className="font-bold text-gray-800 mb-2">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center justify-end w-full">
                  <Trash2 className="w-4 h-4 mr-1" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cột Phải: Tóm tắt đơn hàng và Thông tin giao hàng */}
        <div className="space-y-6">
          
          {/* Thông tin giao hàng nhanh */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin nhận hàng</h3>
            {!user && <p className="text-sm text-red-500 mb-4">*Vui lòng đăng nhập để đặt hàng</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Số điện thoại</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Địa chỉ giao hàng</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" rows="2"></textarea>
              </div>
            </div>
          </div>

          {/* Nút Thanh toán */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-4 text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-medium text-gray-800">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="font-medium text-gray-800">{deliveryFee.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4 mb-6">
              <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">{total.toLocaleString('vi-VN')} đ</span>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={isProcessing}
              className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg text-lg ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'}`}
            >
              {isProcessing ? 'ĐANG XỬ LÝ...' : 'TIẾN HÀNH THANH TOÁN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;