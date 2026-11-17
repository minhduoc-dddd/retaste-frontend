import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  X,
  CheckCircle,
  CalendarCheck,
  Play,
  Square,
  Edit,
  Save,
  Wallet,
  Banknote,
  QrCode,
  Smartphone,
  Star,
  RefreshCw,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  Bot,
  KeyRound
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

const AdminPage = ({ user, showToast }) => {
  const isAdmin =
    user?.name === 'Minh Dược' || ['admin', 'Admin', 'quan_tri'].includes(user?.role);
  const isStaff =
    !isAdmin && ['nhan_vien', 'staff', 'Staff', 'Nhân viên'].includes(user?.role);

  const [activeTab, setActiveTab] = useState(isAdmin ? 'orders' : 'attendance');
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [attendances, setAttendances] = useState([]);

  // Bộ lọc đơn hàng
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Form Thêm / Sửa sản phẩm
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    category: 'Đồ ăn',
    base_price: '',
    description: '',
    image_url: '',
    best_seller: false,
  });

  // Cấu hình hệ thống
  const [sysSettings, setSysSettings] = useState({
    enable_cod: true,
    enable_momo: true,
    enable_bank: true,
    gemini_api_key: '',
    bank_info: { bank_id: 'MB', account_no: '0388889999', account_name: 'RETASTE RESTAURANT' },
  });

  // Trạng thái AI trên trang Admin
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isAnalyzingBiz, setIsAnalyzingBiz] = useState(false);
  const [aiBizReport, setAiBizReport] = useState(null);

  // Chỉnh sửa chấm công
  const [editingAttId, setEditingAttId] = useState(null);
  const [attEditData, setAttEditData] = useState({});

  const safeUserId = user?._id || user?.id || user?.email || user?.username || 'unknown';
  const safeUserName = user?.full_name || user?.name || user?.username || 'Nhân viên';

  const getCurrentDateTime = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    return { dateStr, timeStr };
  };

  // ================= CÁC HÀM TẢI DỮ LIỆU TỪ API =================
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsersList(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchAttendances = async () => {
    try {
      const url = isAdmin
        ? `${API_BASE_URL}/api/attendance`
        : `${API_BASE_URL}/api/attendance?employee_id=${safeUserId}`;
      const res = await axios.get(url);
      setAttendances(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/settings`);
      if (res.data) setSysSettings(res.data);
    } catch (e) {
      console.error('Lỗi lấy cấu hình:', e);
    }
  };

  const refreshAll = () => {
    if (isAdmin || isStaff) {
      fetchProducts();
      fetchOrders();
      fetchAttendances();
    }
    if (isAdmin) {
      fetchUsers();
      fetchSettings();
    }
    showToast?.('Đã làm mới dữ liệu hệ thống!', 'info');
  };

  useEffect(() => {
    if (isAdmin || isStaff) {
      fetchProducts();
      fetchOrders();
      fetchAttendances();
    }
    if (isAdmin) {
      fetchUsers();
      fetchSettings();
    }
  }, [user, isAdmin, isStaff]);

  // ================= XỬ LÝ CẤU HÌNH THANH TOÁN =================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/settings`, sysSettings);
      showToast?.('Đã lưu Cấu hình Thanh toán thành công!', 'success');
    } catch {
      showToast?.('Có lỗi khi lưu cấu hình!', 'error');
    }
  };

  // ================= XỬ LÝ CHẤM CÔNG =================
  const handleCheckIn = async () => {
    try {
      const { dateStr, timeStr } = getCurrentDateTime();
      await axios.post(`${API_BASE_URL}/api/attendance/checkin`, {
        employee_id: safeUserId,
        employee_name: safeUserName,
        date: dateStr,
        check_in_time: timeStr,
      });
      showToast?.('Đã Check-in vào ca thành công!', 'success');
      fetchAttendances();
    } catch (e) {
      showToast?.(e.response?.data?.message || 'Lỗi Check-in!', 'error');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/attendance/checkout/${id}`, {
        check_out_time: getCurrentDateTime().timeStr,
      });
      showToast?.('Đã Check-out kết thúc ca!', 'success');
      fetchAttendances();
    } catch {
      showToast?.('Lỗi Check-out!', 'error');
    }
  };

  const startEditAttendance = (att) => {
    setEditingAttId(att._id);
    setAttEditData({
      check_in_time: att.check_in_time || '',
      check_out_time: att.check_out_time || '',
      status: att.status || 'Đúng giờ',
      note: att.note || '',
    });
  };

  const saveEditAttendance = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/attendance/admin-edit/${id}`, attEditData);
      showToast?.('Đã cập nhật bản ghi chấm công!', 'success');
      setEditingAttId(null);
      fetchAttendances();
    } catch {
      showToast?.('Lỗi cập nhật chấm công!', 'error');
    }
  };

  // ================= XỬ LÝ SẢN PHẨM =================
  const openAddProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      product_name: '',
      category: 'Đồ ăn',
      base_price: '',
      description: '',
      image_url: '',
      best_seller: false,
    });
    setShowProductForm(true);
  };

  const openEditProductForm = (item) => {
    setEditingProductId(item._id);
    setProductForm({
      product_name: item.product_name || '',
      category: item.category || 'Đồ ăn',
      base_price: item.base_price || '',
      description: item.description || '',
      image_url: item.image_url || '',
      best_seller: Boolean(item.best_seller),
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        base_price: Number(productForm.base_price),
      };
      if (editingProductId) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProductId}`, payload);
        showToast?.('Đã cập nhật thông tin món ăn!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, payload);
        showToast?.('Đã thêm món mới vào thực đơn!', 'success');
      }
      setShowProductForm(false);
      setEditingProductId(null);
      fetchProducts();
    } catch {
      showToast?.('Lỗi khi lưu thông tin sản phẩm!', 'error');
    }
  };

  // AI tự động viết mô tả món ăn
  const handleGenerateDescriptionAI = async () => {
    if (!productForm.product_name.trim()) {
      showToast?.('Vui lòng nhập Tên món ăn trước để AI viết mô tả nhé!', 'error');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/generate-description`, {
        product_name: productForm.product_name,
        category: productForm.category,
        base_price: productForm.base_price,
      });
      if (res.data?.description) {
        setProductForm((prev) => ({ ...prev, description: res.data.description }));
        showToast?.('✨ AI đã tạo xong mô tả món ăn hấp dẫn!', 'success');
      }
    } catch {
      showToast?.('Không thể tạo mô tả AI lúc này!', 'error');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // AI phân tích doanh thu & cố vấn chiến lược kinh doanh
  const handleAnalyzeBusinessAI = async () => {
    setIsAnalyzingBiz(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/analyze-business`);
      setAiBizReport(res.data);
      showToast?.('✨ AI đã hoàn tất phân tích dữ liệu kinh doanh!', 'success');
    } catch {
      showToast?.('Lỗi khi gọi AI phân tích kinh doanh!', 'error');
    } finally {
      setIsAnalyzingBiz(false);
    }
  };

  const handleToggleBestSeller = async (item) => {
    try {
      await axios.put(`${API_BASE_URL}/api/products/${item._id}`, {
        best_seller: !item.best_seller,
      });
      fetchProducts();
      showToast?.(
        `Đã ${!item.best_seller ? 'đánh dấu' : 'bỏ đánh dấu'} Best Seller cho "${item.product_name}"`,
        'info'
      );
    } catch {}
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này khỏi thực đơn?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      showToast?.('Đã xóa món ăn khỏi hệ thống!', 'info');
      fetchProducts();
    } catch {}
  };

  // ================= XỬ LÝ ĐƠN HÀNG & NHÂN SỰ =================
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status });
      showToast?.('Đã cập nhật trạng thái đơn hàng!', 'success');
      fetchOrders();
    } catch {
      showToast?.('Lỗi cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/${id}/role`, { role });
      showToast?.('Đã cập nhật phân quyền người dùng!', 'success');
      fetchUsers();
    } catch {
      showToast?.('Lỗi cập nhật phân quyền!', 'error');
    }
  };

  // ================= TÍNH TOÁN THỐNG KÊ =================
  const pendingOrdersCount = orders.filter((o) => o.status === 'cho_duyet').length;
  const completedOrders = orders.filter((o) => o.status === 'hoan_tat');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueCOD = completedOrders
    .filter((o) => o.payment_method === 'cod' || !o.payment_method)
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueBank = completedOrders
    .filter((o) => o.payment_method === 'bank')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueMoMo = completedOrders
    .filter((o) => o.payment_method === 'momo')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  if (!isAdmin && !isStaff) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-red-600 font-bold">Từ chối truy cập.</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const { dateStr: todayStr } = getCurrentDateTime();
  const myTodayRecord = attendances.find(
    (a) => a.date === todayStr && a.employee_id === safeUserId
  );

  const navItems = [
    { id: 'orders', label: 'Quản lý Đơn hàng', icon: FileText, badge: pendingOrdersCount },
    { id: 'products', label: 'Quản lý Thực đơn', icon: Package, badge: products.length },
    { id: 'attendance', label: 'Chấm công Ca làm', icon: CalendarCheck },
    ...(isAdmin
      ? [
          { id: 'revenue', label: 'Thống kê Doanh thu', icon: BarChart3 },
          { id: 'users', label: 'Quản lý Tài khoản', icon: Users, badge: usersList.length },
          { id: 'settings', label: 'Cấu hình Thanh toán', icon: Wallet },
        ]
      : []),
  ];

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Thanh KPI Tóm tắt nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Đơn chờ duyệt</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{pendingOrdersCount} đơn</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng đơn hàng</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{orders.length} đơn</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Món trong Menu</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{products.length} món</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Doanh thu hoàn tất</p>
            <p className="text-xl md:text-2xl font-extrabold text-emerald-600 mt-0.5">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Điều hướng */}
        <div className="w-full lg:w-64 bg-white rounded-3xl shadow-soft border border-slate-200/80 p-4 h-fit lg:sticky lg:top-24 shrink-0">
          <div className="flex items-center justify-between px-3 pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>{isAdmin ? 'Bảng Điều Khiển' : 'Menu Nhân Viên'}</span>
            </h3>
            <button
              onClick={refreshAll}
              title="Làm mới dữ liệu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-orange-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition ${
                    active
                      ? 'bg-primary text-white font-extrabold shadow-md shadow-orange-500/25'
                      : 'text-slate-600 font-semibold hover:bg-slate-100/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                        active ? 'bg-white text-primary' : 'bg-orange-100 text-primary'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nội dung Tab Chính */}
        <div className="flex-grow bg-white rounded-3xl shadow-soft border border-slate-200/80 p-6 min-h-[540px] overflow-x-auto">
          {/* ================= TAB 1: QUẢN LÝ ĐƠN HÀNG ================= */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    Quản lý Đơn đặt hàng
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Theo dõi và cập nhật tiến độ xử lý đơn hàng của thực khách
                  </p>
                </div>

                {/* Bộ lọc trạng thái */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'cho_duyet', label: 'Chờ duyệt' },
                    { id: 'dang_giao', label: 'Đang giao' },
                    { id: 'hoan_tat', label: 'Hoàn tất' },
                    { id: 'da_huy', label: 'Đã hủy' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        orderStatusFilter === st.id
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">Chưa có đơn hàng nào trong trạng thái này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200/80 text-xs uppercase text-slate-500">
                        <th className="p-3.5 font-extrabold">Khách hàng & Địa chỉ</th>
                        <th className="p-3.5 font-extrabold">Chi tiết món đặt</th>
                        <th className="p-3.5 font-extrabold">Tổng tiền</th>
                        <th className="p-3.5 font-extrabold">Thanh toán</th>
                        <th className="p-3.5 font-extrabold">Trạng thái / Xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 align-top">
                            <p className="font-extrabold text-slate-800">
                              {order.customer_info?.name || 'Khách vãng lai'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {order.customer_info?.phone || '---'}
                            </p>
                            {order.customer_info?.address && (
                              <p className="text-xs text-slate-500 flex items-start gap-1 mt-0.5 max-w-xs">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                <span>{order.customer_info.address}</span>
                              </p>
                            )}
                            {order.createdAt && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </td>

                          <td className="p-3.5 align-top">
                            <div className="space-y-1">
                              {(order.items || []).map((i, idx) => (
                                <div key={idx} className="text-xs font-medium text-slate-700">
                                  • {i.product_name}{' '}
                                  <span className="font-extrabold text-primary">x{i.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-3.5 align-top font-extrabold text-primary whitespace-nowrap">
                            {Number(order.total_amount || 0).toLocaleString('vi-VN')} đ
                          </td>

                          <td className="p-3.5 align-top">
                            {order.payment_method === 'bank' ? (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-bold text-xs">
                                <QrCode className="w-3.5 h-3.5" /> VietQR
                              </span>
                            ) : order.payment_method === 'momo' ? (
                              <span className="inline-flex items-center gap-1 text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-lg font-bold text-xs">
                                <Smartphone className="w-3.5 h-3.5" /> Ví MoMo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg font-bold text-xs">
                                <Banknote className="w-3.5 h-3.5" /> Tiền mặt (COD)
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 align-top">
                            <select
                              value={order.status || 'cho_duyet'}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className={`text-xs font-extrabold px-3 py-2 rounded-xl border cursor-pointer focus:outline-none ${
                                order.status === 'hoan_tat'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'dang_giao'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : order.status === 'da_huy'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="cho_duyet">⏳ Chờ duyệt</option>
                              <option value="dang_giao">🛵 Đang giao</option>
                              <option value="hoan_tat">✅ Hoàn tất</option>
                              <option value="da_huy">❌ Đã hủy</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: QUẢN LÝ SẢN PHẨM ================= */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    Danh sách Thực đơn ({products.length} món)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thêm món mới, chỉnh sửa giá bán hoặc đánh dấu món Best Seller
                  </p>
                </div>
                <button
                  onClick={() => (showProductForm ? setShowProductForm(false) : openAddProductForm())}
                  className="bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md shadow-orange-500/20 w-fit"
                >
                  {showProductForm ? (
                    <>
                      <X className="w-4 h-4" /> Đóng biểu mẫu
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Thêm món mới
                    </>
                  )}
                </button>
              </div>

              {showProductForm && (
                <form
                  onSubmit={handleSaveProduct}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="md:col-span-2 flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                    <h3 className="font-extrabold text-slate-800">
                      {editingProductId ? 'Chỉnh sửa thông tin món ăn' : 'Thêm món ăn mới vào thực đơn'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Tên món ăn (*)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Phở Bò Tái Lăn"
                      value={productForm.product_name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, product_name: e.target.value })
                      }
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Danh mục (*)
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Đồ ăn">Đồ ăn</option>
                      <option value="Thức uống">Thức uống</option>
                      <option value="Combo">Combo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Giá bán (VNĐ) (*)
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder="VD: 55000"
                      value={productForm.base_price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, base_price: e.target.value })
                      }
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Đường dẫn hình ảnh (URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={productForm.image_url}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image_url: e.target.value })
                      }
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">
                        Mô tả hương vị
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateDescriptionAI}
                        disabled={isGeneratingDesc}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-gradient-to-r from-primary to-amber-500 text-white px-3 py-1 rounded-full shadow-sm hover:opacity-95 disabled:opacity-50 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingDesc ? 'AI đang viết...' : 'AI Tự viết mô tả'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập mô tả hoặc bấm nút 'AI Tự viết mô tả' ở góc phải..."
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({ ...productForm, description: e.target.value })
                      }
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.best_seller}
                        onChange={(e) =>
                          setProductForm({ ...productForm, best_seller: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-sm font-bold text-slate-700">
                        Đánh dấu là Món Bán Chạy (Best Seller)
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl text-sm shadow"
                      >
                        {editingProductId ? 'Lưu cập nhật' : 'Lưu món ăn'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200/80 text-xs uppercase text-slate-500">
                      <th className="p-3.5 font-extrabold">Món ăn</th>
                      <th className="p-3.5 font-extrabold">Danh mục</th>
                      <th className="p-3.5 font-extrabold">Giá bán</th>
                      <th className="p-3.5 font-extrabold text-center">Nổi bật</th>
                      <th className="p-3.5 font-extrabold text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {products.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 flex items-center gap-3.5">
                          <img
                            src={item.image_url || FALLBACK_FOOD_IMG}
                            alt={item.product_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_FOOD_IMG;
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-800">{item.product_name}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {item.description || 'Món ngon chuẩn vị RETASTE'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-extrabold text-primary">
                          {Number(item.base_price || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleBestSeller(item)}
                            title="Bật/Tắt Best Seller"
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition ${
                              item.best_seller
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.best_seller ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                            <span>{item.best_seller ? 'Best Seller' : 'Thường'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditProductForm(item)}
                              title="Chỉnh sửa"
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item._id)}
                              title="Xóa món"
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: QUẢN LÝ CHẤM CÔNG ================= */}
          {activeTab === 'attendance' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    {isAdmin ? 'Quản lý Chấm công Nhân sự' : 'Bảng Chấm công của tôi'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận thời gian vào ca (Check-in) và kết thúc ca (Check-out) theo ngày
                  </p>
                </div>

                <div className="bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200/70 flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">
                    Ca ngày: <strong className="text-primary font-extrabold">{todayStr}</strong>
                  </span>
                  {!myTodayRecord ? (
                    <button
                      onClick={handleCheckIn}
                      className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" /> Check-in Vào ca
                    </button>
                  ) : !myTodayRecord.check_out_time ? (
                    <button
                      onClick={() => handleCheckOut(myTodayRecord._id)}
                      className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
                    >
                      <Square className="w-3.5 h-3.5 mr-1.5" /> Check-out Tan ca
                    </button>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Đã hoàn thành ca
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200/80 text-xs uppercase text-slate-500">
                      <th className="p-3.5 font-extrabold">Nhân viên</th>
                      <th className="p-3.5 font-extrabold">Ngày</th>
                      <th className="p-3.5 font-extrabold">Giờ vào</th>
                      <th className="p-3.5 font-extrabold">Giờ ra</th>
                      <th className="p-3.5 font-extrabold">Trạng thái</th>
                      <th className="p-3.5 font-extrabold">Ghi chú</th>
                      {isAdmin && <th className="p-3.5 font-extrabold text-center">Điều chỉnh</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {attendances.map((att) => {
                      const isEditing = editingAttId === att._id;
                      return (
                        <tr key={att._id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-extrabold text-slate-800">
                            {att.employee_name}
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-slate-600">{att.date}</td>
                          <td className="p-3.5">
                            {isEditing ? (
                              <input
                                type="time"
                                value={attEditData.check_in_time}
                                onChange={(e) =>
                                  setAttEditData({ ...attEditData, check_in_time: e.target.value })
                                }
                                className="border rounded-lg p-1.5 text-xs"
                              />
                            ) : (
                              <span className="text-emerald-600 font-extrabold">
                                {att.check_in_time || '--:--'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isEditing ? (
                              <input
                                type="time"
                                value={attEditData.check_out_time}
                                onChange={(e) =>
                                  setAttEditData({ ...attEditData, check_out_time: e.target.value })
                                }
                                className="border rounded-lg p-1.5 text-xs"
                              />
                            ) : (
                              <span className="text-red-500 font-extrabold">
                                {att.check_out_time || '--:--'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isEditing ? (
                              <select
                                value={attEditData.status}
                                onChange={(e) =>
                                  setAttEditData({ ...attEditData, status: e.target.value })
                                }
                                className="border rounded-lg p-1.5 text-xs font-bold"
                              >
                                <option value="Đúng giờ">Đúng giờ</option>
                                <option value="Đi muộn">Đi muộn</option>
                                <option value="Về sớm">Về sớm</option>
                                <option value="Vắng mặt">Vắng mặt</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                  att.status === 'Đúng giờ'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {att.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isEditing ? (
                              <input
                                type="text"
                                placeholder="Ghi chú..."
                                value={attEditData.note}
                                onChange={(e) =>
                                  setAttEditData({ ...attEditData, note: e.target.value })
                                }
                                className="border rounded-lg p-1.5 text-xs w-36"
                              />
                            ) : (
                              <span className="text-xs text-slate-500">{att.note || '---'}</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="p-3.5 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => saveEditAttendance(att._id)}
                                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    title="Lưu"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAttId(null)}
                                    className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                                    title="Hủy"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditAttendance(att)}
                                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {attendances.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center p-10 text-slate-400 font-medium">
                          Chưa có dữ liệu chấm công nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: THỐNG KÊ DOANH THU ================= */}
          {activeTab === 'revenue' && isAdmin && (
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                Thống kê Doanh thu & Dòng tiền
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Tổng hợp doanh thu thực tế từ các đơn hàng đã Hoàn tất ({completedOrders.length} đơn)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                      Tổng Doanh thu
                    </p>
                    <BarChart3 className="text-white/80 w-5 h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold">
                    {totalRevenue.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-emerald-100 mt-2">
                    {completedOrders.length} đơn hoàn tất
                  </p>
                </div>

                <div className="bg-orange-50/80 border border-orange-200/80 p-5 rounded-3xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-extrabold text-orange-700 uppercase">
                      Tiền mặt (COD)
                    </p>
                    <Banknote className="text-orange-500 w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-orange-900">
                    {revenueCOD.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    Chiếm {totalRevenue > 0 ? Math.round((revenueCOD / totalRevenue) * 100) : 0}% tổng thu
                  </p>
                </div>

                <div className="bg-blue-50/80 border border-blue-200/80 p-5 rounded-3xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-extrabold text-blue-700 uppercase">
                      Chuyển khoản VietQR
                    </p>
                    <QrCode className="text-blue-500 w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-blue-900">
                    {revenueBank.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Chiếm {totalRevenue > 0 ? Math.round((revenueBank / totalRevenue) * 100) : 0}% tổng thu
                  </p>
                </div>

                <div className="bg-pink-50/80 border border-pink-200/80 p-5 rounded-3xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-extrabold text-pink-700 uppercase">Ví MoMo</p>
                    <Smartphone className="text-pink-500 w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-pink-900">
                    {revenueMoMo.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-pink-600 mt-2">
                    Chiếm {totalRevenue > 0 ? Math.round((revenueMoMo / totalRevenue) * 100) : 0}% tổng thu
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Đơn hàng đã hoàn tất</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">
                    {completedOrders.length} / {orders.length} đơn
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Giá trị trung bình / đơn</p>
                  <p className="text-2xl font-extrabold text-primary mt-1">
                    {completedOrders.length > 0
                      ? Math.round(totalRevenue / completedOrders.length).toLocaleString('vi-VN')
                      : 0}{' '}
                    đ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Quy mô thực đơn</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">
                    {products.length} món kinh doanh
                  </p>
                </div>
              </div>

              {/* Khối AI Cố vấn Kinh doanh & Phân tích Doanh thu */}
              <div className="mt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold">
                          AI Cố vấn Kinh doanh & Phân tích Dòng tiền
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2.5 py-0.5 rounded-full">
                          Gemini 4 Hydrogen
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tự động tổng hợp dữ liệu đơn hàng thực tế và đề xuất chiến lược tăng doanh số
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeBusinessAI}
                    disabled={isAnalyzingBiz}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/25 transition shrink-0"
                  >
                    <Sparkles className={`w-4 h-4 ${isAnalyzingBiz ? 'animate-spin' : ''}`} />
                    <span>
                      {isAnalyzingBiz ? 'AI đang phân tích...' : 'Phân tích Doanh thu bằng AI'}
                    </span>
                  </button>
                </div>

                {aiBizReport ? (
                  <div className="pt-5 space-y-5">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-1">
                        📊 Tổng quan tình hình kinh doanh
                      </p>
                      <p className="text-sm text-slate-100 leading-relaxed">
                        {aiBizReport.summary}
                      </p>
                    </div>

                    {Array.isArray(aiBizReport.topDishes) && aiBizReport.topDishes.length > 0 && (
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-300 mb-2.5">
                          🏆 Top món ăn mang lại doanh số cao nhất
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {aiBizReport.topDishes.map((d, i) => (
                            <div
                              key={i}
                              className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between"
                            >
                              <div>
                                <span className="text-[11px] font-bold text-amber-400">
                                  Hạng #{i + 1}
                                </span>
                                <p className="font-extrabold text-sm text-white line-clamp-1">
                                  {d.name}
                                </p>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  {Number(d.revenue || 0).toLocaleString('vi-VN')} đ
                                </p>
                              </div>
                              <span className="bg-orange-500/20 text-orange-300 text-xs font-extrabold px-2.5 py-1 rounded-xl">
                                {d.quantity} phần
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 mb-2.5">
                        💡 Đề xuất chiến lược từ AI cho Chủ quán
                      </p>
                      <div className="space-y-2.5">
                        {(aiBizReport.actionableTips || []).map((tip, idx) => (
                          <div
                            key={idx}
                            className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-5 text-center text-xs sm:text-sm text-slate-300">
                    Bấm nút <strong>"Phân tích Doanh thu bằng AI"</strong> ở góc trên để AI đọc dữ liệu đơn hàng thực tế và đưa ra khuyến nghị kinh doanh.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 5: QUẢN LÝ NGƯỜI DÙNG ================= */}
          {activeTab === 'users' && isAdmin && (
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                Quản lý Tài khoản & Phân quyền
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Cấp quyền Nhân viên hoặc Quản trị viên cho các thành viên trong hệ thống
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200/80 text-xs uppercase text-slate-500">
                      <th className="p-3.5 font-extrabold">Họ và tên</th>
                      <th className="p-3.5 font-extrabold">Email</th>
                      <th className="p-3.5 font-extrabold">Vai trò hiện tại</th>
                      <th className="p-3.5 font-extrabold">Thay đổi quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-extrabold text-slate-800">{u.full_name}</td>
                        <td className="p-3.5 text-slate-600">{u.email}</td>
                        <td className="p-3.5">
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : u.role === 'nhan_vien'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role === 'admin'
                              ? 'Quản trị viên'
                              : u.role === 'nhan_vien'
                              ? 'Nhân viên'
                              : 'Khách hàng'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold bg-white cursor-pointer"
                          >
                            <option value="khach_hang">Khách hàng</option>
                            <option value="nhan_vien">Nhân viên</option>
                            <option value="admin">Admin (Chủ quán)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: CẤU HÌNH THANH TOÁN ================= */}
          {activeTab === 'settings' && isAdmin && (
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                Cấu hình Cổng Thanh toán
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Bật/tắt các phương thức thanh toán và cấu hình tài khoản ngân hàng nhận VietQR tự động
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleSaveSettings}
                  className="lg:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6"
                >
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
                      1. Bật / Tắt các phương thức thanh toán
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 bg-white rounded-2xl border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sysSettings.enable_cod}
                          onChange={(e) =>
                            setSysSettings({ ...sysSettings, enable_cod: e.target.checked })
                          }
                          className="w-5 h-5 accent-primary rounded"
                        />
                        <span className="ml-3 font-bold text-sm text-slate-800">
                          Cho phép Thanh toán tiền mặt khi nhận hàng (COD)
                        </span>
                      </label>

                      <label className="flex items-center p-3 bg-white rounded-2xl border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sysSettings.enable_bank}
                          onChange={(e) =>
                            setSysSettings({ ...sysSettings, enable_bank: e.target.checked })
                          }
                          className="w-5 h-5 accent-primary rounded"
                        />
                        <span className="ml-3 font-bold text-sm text-slate-800">
                          Cho phép Khách quét mã Chuyển khoản Ngân hàng (VietQR)
                        </span>
                      </label>

                      <label className="flex items-center p-3 bg-white rounded-2xl border border-slate-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sysSettings.enable_momo}
                          onChange={(e) =>
                            setSysSettings({ ...sysSettings, enable_momo: e.target.checked })
                          }
                          className="w-5 h-5 accent-primary rounded"
                        />
                        <span className="ml-3 font-bold text-sm text-slate-800">
                          Cho phép Thanh toán qua Ví điện tử MoMo (Sandbox)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
                      2. Thông tin Tài khoản Ngân hàng (Tạo mã VietQR)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Mã Ngân hàng (VD: MB, VCB, CTG, TCB, ACB...)
                        </label>
                        <input
                          type="text"
                          value={sysSettings.bank_info?.bank_id || ''}
                          onChange={(e) =>
                            setSysSettings({
                              ...sysSettings,
                              bank_info: { ...sysSettings.bank_info, bank_id: e.target.value },
                            })
                          }
                          className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Số Tài Khoản Nhận Tiền
                        </label>
                        <input
                          type="text"
                          value={sysSettings.bank_info?.account_no || ''}
                          onChange={(e) =>
                            setSysSettings({
                              ...sysSettings,
                              bank_info: { ...sysSettings.bank_info, account_no: e.target.value },
                            })
                          }
                          className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Tên Chủ Tài Khoản (Viết HOA, không dấu)
                        </label>
                        <input
                          type="text"
                          value={sysSettings.bank_info?.account_name || ''}
                          onChange={(e) =>
                            setSysSettings({
                              ...sysSettings,
                              bank_info: {
                                ...sysSettings.bank_info,
                                account_name: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-primary" />
                      <span>3. Cấu hình Trí tuệ Nhân tạo (Google Gemini API)</span>
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Gemini API Key (Tùy chọn - Lấy tại Google AI Studio)
                      </label>
                      <input
                        type="password"
                        placeholder="AIzaSy... (Để trống nếu dùng biến môi trường hoặc chế độ Smart Hybrid)"
                        value={sysSettings.gemini_api_key || ''}
                        onChange={(e) =>
                          setSysSettings({ ...sysSettings, gemini_api_key: e.target.value })
                        }
                        className="w-full p-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Hệ thống hỗ trợ mô hình <strong>gemini-4-hydrogen</strong> &{' '}
                        <strong>gemini-3.5-flash-lite</strong> và tự động kích hoạt chế độ AI nội bộ thông minh khi chưa điền Key.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-orange-600 text-white font-extrabold py-3 px-6 rounded-xl shadow-md shadow-orange-500/20 transition"
                  >
                    Lưu toàn bộ Cấu hình
                  </button>
                </form>

                {/* Khung xem trước mã VietQR trực tiếp */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-3xl p-5 text-center flex flex-col items-center justify-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-3">
                    Xem trước mã VietQR
                  </span>
                  <img
                    src={`https://img.vietqr.io/image/${
                      sysSettings.bank_info?.bank_id || 'MB'
                    }-${
                      sysSettings.bank_info?.account_no || '0388889999'
                    }-compact2.png?amount=50000&addInfo=RETASTE%20TEST&accountName=${encodeURIComponent(
                      sysSettings.bank_info?.account_name || 'RETASTE'
                    )}`}
                    alt="VietQR Preview"
                    className="w-56 h-56 rounded-2xl shadow bg-white p-2 border border-white object-contain"
                  />
                  <p className="text-xs text-slate-500 mt-3">
                    Mã QR mẫu (50.000đ) tự động tạo theo cấu hình ngân hàng của bạn.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;