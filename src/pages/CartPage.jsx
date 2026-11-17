import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  QrCode,
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  Receipt
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

const CartPage = ({ cart, updateQuantity, removeItem, clearCart, user, showToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || user?.full_name || '',
    phone: user?.phone_number || '',
    address: '',
  });

  const [sysSettings, setSysSettings] = useState({
    enable_cod: true,
    enable_momo: true,
    enable_bank: true,
    bank_info: { bank_id: 'MB', account_no: '0388889999', account_name: 'RETASTE RESTAURANT' }
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: prev.name || user.name || user.full_name || '',
        phone: prev.phone || user.phone_number || '',
      }));
    }
  }, [user]);

  // Lấy cấu hình thanh toán động từ Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`);
        if (res.data) {
          setSysSettings(res.data);
          // Tự động chọn phương thức thanh toán đầu tiên được bật
          if (res.data.enable_cod) setPaymentMethod('cod');
          else if (res.data.enable_bank) setPaymentMethod('bank');
          else if (res.data.enable_momo) setPaymentMethod('momo');
        }
      } catch {
        // Giữ cấu hình mặc định nếu không lấy được
      }
    };
    fetchSettings();
  }, []);

  // Lấy lịch sử đơn hàng của người dùng đang đăng nhập
  useEffect(() => {
    const uid = user?.id || user?._id;
    if (!uid) {
      setMyOrders([]);
      return;
    }
    axios
      .get(`${API_BASE_URL}/api/orders?user_id=${uid}`)
      .then((res) => setMyOrders(Array.isArray(res.data) ? res.data.slice(0, 5) : []))
      .catch(() => {});
  }, [user, paymentSuccess]);

  // Xử lý kết quả trả về từ cổng thanh toán MoMo
  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    if (resultCode === '0') {
      const savedPending = sessionStorage.getItem('retaste_last_order');
      if (savedPending) {
        try {
          setLastOrder(JSON.parse(savedPending));
        } catch {}
      }
      setPaymentSuccess(true);
      clearCart();
      showToast?.('Thanh toán MoMo thành công!', 'success');
    } else if (resultCode && resultCode !== '0') {
      showToast?.('Giao dịch MoMo đã bị hủy hoặc chưa hoàn tất.', 'error');
      navigate('/cart', { replace: true });
    }
  }, [searchParams, clearCart, navigate, showToast]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.base_price ?? item.price ?? 0) * item.quantity,
    0
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast?.('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }

    setLoading(true);
    const orderPayload = {
      user_id: user?.id || user?._id || undefined,
      customer_info: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim(),
      },
      items: cart.map((item) => ({
        product_id: item._id || item.id,
        product_name: item.product_name || item.name,
        quantity: item.quantity,
        price: Number(item.base_price ?? item.price ?? 0),
      })),
      total_amount: totalAmount,
      payment_method: paymentMethod,
      status: 'cho_duyet',
    };

    const orderSnapshot = {
      amount: totalAmount,
      paymentMethod,
      customerName: customerInfo.name.trim(),
      phone: customerInfo.phone.trim(),
      address: customerInfo.address.trim(),
      items: [...cart],
    };

    try {
      // Lưu đơn hàng vào MongoDB trước
      const createdOrderRes = await axios.post(`${API_BASE_URL}/api/orders`, orderPayload);
      orderSnapshot.orderId = createdOrderRes.data?._id;

      if (paymentMethod === 'momo') {
        sessionStorage.setItem('retaste_last_order', JSON.stringify(orderSnapshot));
        const momoRes = await axios.post(`${API_BASE_URL}/api/payment/momo`, {
          amount: Math.round(totalAmount),
          orderInfo: `Thanh toan RETASTE - KH ${customerInfo.name}`,
          redirectBaseUrl: window.location.origin,
        });
        if (momoRes.data?.payUrl) {
          window.location.href = momoRes.data.payUrl;
          return;
        }
      }

      setLastOrder(orderSnapshot);
      setPaymentSuccess(true);
      clearCart();
      showToast?.('Đặt hàng thành công!', 'success');
    } catch (error) {
      console.error(error);
      showToast?.(
        error.response?.data?.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG =================
  if (paymentSuccess) {
    const finalAmount = lastOrder?.amount || totalAmount || 0;
    const finalMethod = lastOrder?.paymentMethod || paymentMethod;
    const finalName = lastOrder?.customerName || customerInfo.name || 'Khách hàng';
    const bankId = sysSettings.bank_info?.bank_id || 'MB';
    const accountNo = sysSettings.bank_info?.account_no || '0388889999';
    const accountName = encodeURIComponent(
      sysSettings.bank_info?.account_name || 'RETASTE RESTAURANT'
    );
    const transferContent = encodeURIComponent(`RETASTE ${finalName}`);

    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-emerald-100 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
            Đặt hàng thành công!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Cảm ơn <strong className="text-slate-700">{finalName}</strong> đã lựa chọn thưởng thức ẩm thực tại RETASTE.
          </p>

          {/* Khối hiển thị thông tin tóm tắt đơn hàng */}
          <div className="bg-slate-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-6 border border-slate-200/70">
            <div className="flex justify-between">
              <span className="text-slate-500">Tổng thanh toán:</span>
              <span className="font-extrabold text-primary text-base">
                {Number(finalAmount).toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phương thức:</span>
              <span className="font-bold text-slate-700 uppercase">
                {finalMethod === 'bank'
                  ? 'Chuyển khoản VietQR'
                  : finalMethod === 'momo'
                  ? 'Ví điện tử MoMo'
                  : 'Tiền mặt khi nhận hàng (COD)'}
              </span>
            </div>
            {lastOrder?.address && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 shrink-0">Giao đến:</span>
                <span className="font-medium text-slate-700 text-right">{lastOrder.address}</span>
              </div>
            )}
          </div>

          {finalMethod === 'bank' ? (
            <div className="mt-4 mb-6 bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
              <p className="text-slate-700 font-semibold text-sm mb-3">
                Quét mã VietQR dưới đây bằng ứng dụng Ngân hàng để chuyển khoản tự động:
              </p>
              <img
                src={`https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${finalAmount}&addInfo=${transferContent}&accountName=${accountName}`}
                alt="VietQR"
                className="w-64 h-64 mx-auto rounded-2xl shadow-md border border-white bg-white p-2 object-contain"
              />
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p>
                  Ngân hàng: <strong>{bankId}</strong> — STK: <strong>{accountNo}</strong>
                </p>
                <p className="font-bold text-blue-700">
                  Đơn hàng sẽ được xác nhận ngay khi hệ thống nhận được thanh toán.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-sm mb-6 bg-orange-50/70 py-3 px-4 rounded-xl border border-orange-100">
              Nhà bếp RETASTE đã nhận được yêu cầu và đang chuẩn bị món ăn nóng hổi cho bạn!
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/menu"
              onClick={() => setPaymentSuccess(false)}
              className="inline-flex items-center justify-center bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition"
            >
              Tiếp tục chọn món
            </Link>
            <Link
              to="/"
              onClick={() => setPaymentSuccess(false)}
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Giỏ hàng & Thanh toán
          </h1>
          <p className="text-sm text-slate-500">
            Kiểm tra lại danh sách món ăn và điền thông tin giao hàng
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center text-sm font-bold text-primary hover:text-orange-700 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Chọn thêm món khác
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-200/70 py-16 px-6 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Hãy khám phá thực đơn đa dạng của RETASTE để chọn cho mình những món ngon ưng ý nhất nhé!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-md shadow-orange-500/25 transition"
          >
            Xem thực đơn ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Danh sách món ăn */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-slate-200/70 p-6 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span>Món ăn đã chọn ({cart.length} món)</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có muốn xóa toàn bộ giỏ hàng?')) {
                    clearCart();
                  }
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => {
                const itemId = item._id || item.id;
                const itemName = item.product_name || item.name;
                const itemPrice = Number(item.base_price ?? item.price ?? 0);
                const itemImg = item.image_url || item.img || item.image || FALLBACK_FOOD_IMG;

                return (
                  <div
                    key={itemId}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={itemImg}
                        alt={itemName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_FOOD_IMG;
                        }}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">{itemName}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Đơn giá:{' '}
                          <span className="font-bold text-primary">
                            {itemPrice.toLocaleString('vi-VN')} đ
                          </span>
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                          Tạm tính: {(itemPrice * item.quantity).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, -1)}
                          className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold w-8 text-center text-sm text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, 1)}
                          className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(itemId)}
                        title="Xóa món này"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Thông tin giao hàng & Thanh toán */}
          <form
            onSubmit={handleCheckout}
            className="bg-white rounded-3xl shadow-soft border border-slate-200/70 p-6 h-fit sticky top-24"
          >
            <h2 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              Thông tin giao hàng
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Họ và tên người nhận (*)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Số điện thoại liên hệ (*)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0905123456"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Địa chỉ nhận món (*)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows="2"
                    placeholder="Số nhà, tên đường, phường/xã..."
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Phương thức thanh toán
            </h3>
            <div className="space-y-2.5 mb-6">
              {sysSettings.enable_cod && (
                <label
                  className={`flex items-center p-3.5 border rounded-2xl cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-orange-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mr-3 accent-primary"
                  />
                  <Truck className="w-5 h-5 mr-2.5 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      Tiền mặt khi nhận hàng (COD)
                    </span>
                    <span className="text-xs text-slate-500">Thanh toán trực tiếp cho shipper</span>
                  </div>
                </label>
              )}

              {sysSettings.enable_bank && (
                <label
                  className={`flex items-center p-3.5 border rounded-2xl cursor-pointer transition ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="mr-3 accent-blue-600"
                  />
                  <QrCode className="w-5 h-5 mr-2.5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-blue-800 block">
                      Chuyển khoản Ngân hàng (VietQR)
                    </span>
                    <span className="text-xs text-slate-500">Tạo mã QR tự động đúng số tiền</span>
                  </div>
                </label>
              )}

              {sysSettings.enable_momo && (
                <label
                  className={`flex items-center p-3.5 border rounded-2xl cursor-pointer transition ${
                    paymentMethod === 'momo'
                      ? 'border-pink-600 bg-pink-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    className="mr-3 accent-pink-600"
                  />
                  <CreditCard className="w-5 h-5 mr-2.5 text-pink-600 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-pink-700 block">
                      Ví điện tử MoMo
                    </span>
                    <span className="text-xs text-slate-500">Cổng thanh toán MoMo Sandbox</span>
                  </div>
                </label>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Phí giao hàng:</span>
                <span className="font-semibold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">Tổng thanh toán:</span>
                <span className="text-2xl font-extrabold text-primary">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-white shadow-lg transition active:scale-[0.99] ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : paymentMethod === 'momo'
                  ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/25'
                  : paymentMethod === 'bank'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                  : 'bg-primary hover:bg-orange-600 shadow-orange-500/25'
              }`}
            >
              {loading ? 'Đang xử lý đơn hàng...' : 'Xác nhận Đặt hàng'}
            </button>
          </form>
        </div>
      )}

      {/* Lịch sử đơn hàng gần đây của Khách hàng */}
      {myOrders.length > 0 && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-200/70 p-6">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>Đơn đặt hàng gần đây của bạn</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myOrders.map((ord) => (
              <div
                key={ord._id}
                className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{String(ord._id).slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        ord.status === 'hoan_tat'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ord.status === 'dang_giao'
                          ? 'bg-blue-100 text-blue-700'
                          : ord.status === 'da_huy'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ord.status === 'hoan_tat'
                        ? 'Hoàn tất'
                        : ord.status === 'dang_giao'
                        ? 'Đang giao'
                        : ord.status === 'da_huy'
                        ? 'Đã hủy'
                        : 'Chờ duyệt'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 mb-3">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate pr-2">
                          {it.product_name} <strong className="text-slate-800">x{it.quantity}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString('vi-VN')
                      : 'Hôm nay'}
                  </span>
                  <span className="font-extrabold text-primary text-sm">
                    {Number(ord.total_amount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;