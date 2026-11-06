import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Truck, CheckCircle, QrCode } from 'lucide-react';
import axios from 'axios';

const CartPage = ({ cart, updateQuantity, removeItem, clearCart, user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || user?.full_name || '',
    phone: '',
    address: '',
  });

  const [sysSettings, setSysSettings] = useState({
    enable_cod: true, enable_momo: true, enable_bank: true, bank_info: {}
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (user) setCustomerInfo(prev => ({ ...prev, name: prev.name || user.name || user.full_name || '' }));
  }, [user]);

  // Lấy cấu hình thanh toán động từ Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data) setSysSettings(res.data);
      } catch (error) { console.log('Không lấy được cấu hình'); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    if (resultCode === '0') {
      setPaymentSuccess(true);
      clearCart();
    } else if (resultCode && resultCode !== '0') {
      alert('Giao dịch MoMo bị hủy.'); navigate('/cart', { replace: true });
    }
  }, [searchParams]);

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.base_price || item.price || 0) * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Giỏ hàng đang trống!');
    
    setLoading(true);
    const orderPayload = {
      customer_info: { name: customerInfo.name, phone: customerInfo.phone, address: customerInfo.address },
      items: cart.map(item => ({
        product_id: item._id || item.id,
        product_name: item.product_name || item.name,
        quantity: item.quantity,
        price: Number(item.base_price || item.price || 0),
      })),
      total_amount: totalAmount,
      payment_method: paymentMethod, // Lấy đúng tên phương thức lưu vào DB
      status: 'cho_duyet',
    };

    try {
      if (paymentMethod === 'momo') {
        const momoRes = await axios.post('http://localhost:5000/api/payment/momo', {
          amount: Math.round(totalAmount),
          orderInfo: `Thanh toan RETASTE - KH ${customerInfo.name}`,
        });
        if (momoRes.data?.payUrl) { window.location.href = momoRes.data.payUrl; return; }
      } else {
        // Xử lý chung cho COD và Chuyển khoản VietQR
        await axios.post('http://localhost:5000/api/orders', orderPayload);
        setPaymentSuccess(true);
        clearCart();
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  // Màn hình thành công (Có hiển thị hướng dẫn quét mã QR nếu chọn VietQR)
  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
          
          {paymentMethod === 'bank' ? (
            <div className="mt-4 mb-6">
              <p className="text-gray-600 mb-4">Vui lòng dùng App Ngân hàng quét mã QR dưới đây để thanh toán tự động:</p>
              <img 
                src={`https://img.vietqr.io/image/${sysSettings.bank_info?.bank_id}-${sysSettings.bank_info?.account_no}-compact2.png?amount=${totalAmount}&addInfo=RETASTE ${customerInfo.name}&accountName=${sysSettings.bank_info?.account_name}`} 
                alt="VietQR" 
                className="w-64 h-64 mx-auto rounded-xl shadow-lg border"
              />
              <p className="mt-4 text-sm font-bold text-primary">Đơn hàng sẽ được xử lý ngay khi nhận được thanh toán.</p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được ghi nhận. Nhà hàng đang chuẩn bị món!</p>
          )}

          <Link to="/menu" className="inline-block bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow transition">Tiếp tục mua sắm</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) return (<div className="container mx-auto py-16 text-center"><h2 className="text-2xl font-bold">Giỏ hàng trống</h2><Link to="/menu" className="mt-4 inline-block bg-primary text-white px-6 py-3 rounded-xl">Xem thực đơn</Link></div>);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Giỏ hàng & Thanh toán</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Món ăn đã chọn ({cart.length})</h2>
          <div className="divide-y">
            {cart.map((item) => (
              <div key={item._id || item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4"><img src={item.image_url || item.image || 'https://via.placeholder.com/80'} className="w-16 h-16 rounded-xl object-cover" /><div><h3 className="font-bold">{item.product_name || item.name}</h3><p className="text-primary font-bold">{Number(item.base_price || item.price || 0).toLocaleString('vi-VN')} đ</p></div></div>
                <div className="flex items-center gap-3"><button onClick={() => updateQuantity(item._id || item.id, -1)} className="p-1.5 bg-gray-100 rounded-lg"><Minus className="w-4 h-4" /></button><span className="font-bold w-6 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item._id || item.id, 1)} className="p-1.5 bg-gray-100 rounded-lg"><Plus className="w-4 h-4" /></button><button onClick={() => removeItem(item._id || item.id)} className="ml-2 p-2 text-red-500"><Trash2 className="w-5 h-5" /></button></div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Thông tin giao hàng</h2>
          <div className="space-y-4 mb-6">
            <div><label className="block text-sm font-medium mb-1">Họ và tên (*)</label><input type="text" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1">Số điện thoại (*)</label><input type="tel" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1">Địa chỉ (*)</label><textarea required rows="2" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
          </div>

          <h3 className="font-bold text-gray-800 mb-3">Phương thức thanh toán</h3>
          <div className="space-y-3 mb-6">
            
            {/* Lựa chọn được lấy động từ Cấu hình Backend */}
            {sysSettings.enable_cod && (
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-orange-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-3 accent-primary" />
                <Truck className="w-5 h-5 mr-2 text-primary" /><span className="font-medium">Tiền mặt (COD)</span>
              </label>
            )}

            {sysSettings.enable_momo && (
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer ${paymentMethod === 'momo' ? 'border-pink-600 bg-pink-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="mr-3 accent-pink-600" />
                <CreditCard className="w-5 h-5 mr-2 text-pink-600" /><span className="font-bold text-pink-700">Ví MoMo</span>
              </label>
            )}

            {sysSettings.enable_bank && (
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="mr-3 accent-blue-600" />
                <QrCode className="w-5 h-5 mr-2 text-blue-600" /><span className="font-bold text-blue-700">Chuyển khoản (VietQR)</span>
              </label>
            )}
          </div>

          <div className="border-t pt-4 mb-6 flex justify-between items-center"><span className="text-gray-600 font-medium">Tổng thanh toán:</span><span className="text-2xl font-extrabold text-primary">{totalAmount.toLocaleString('vi-VN')} đ</span></div>
          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-bold text-white shadow-md ${paymentMethod === 'momo' ? 'bg-pink-600' : paymentMethod === 'bank' ? 'bg-blue-600' : 'bg-primary'}`}>
            {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CartPage;