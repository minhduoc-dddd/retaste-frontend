import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Users, FileText, BarChart3, Settings, Plus, Trash2, X, 
  CheckCircle, CalendarCheck, Play, Square, Edit, Save, Wallet, Banknote, QrCode, Smartphone 
} from 'lucide-react';
import axios from 'axios';

const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('attendance'); // Mặc định mở tab Chấm công cho tiện
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // State cấu hình thanh toán
  const [sysSettings, setSysSettings] = useState({
    enable_cod: true, enable_momo: true, enable_bank: true,
    bank_info: { bank_id: 'MB', account_no: '', account_name: '' }
  });

  const [editingAttId, setEditingAttId] = useState(null);
  const [attEditData, setAttEditData] = useState({});

  const [newProduct, setNewProduct] = useState({
    product_name: '', category: 'Đồ ăn', base_price: '', description: '', image_url: ''
  });

  const isAdmin = user?.name === 'Minh Dược' || ['admin', 'Admin', 'quan_tri'].includes(user?.role);
  const isStaff = !isAdmin && ['nhan_vien', 'staff', 'Staff', 'Nhân viên'].includes(user?.role);

  // ================= ĐẢM BẢO LẤY ĐÚNG THÔNG TIN NHÂN VIÊN =================
  const safeUserId = user?._id || user?.id || user?.email || user?.username || 'unknown';
  const safeUserName = user?.full_name || user?.name || user?.username || 'Nhân viên';

  const getCurrentDateTime = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return { dateStr, timeStr };
  };

  const fetchProducts = async () => {
    try { const res = await axios.get('http://localhost:5000/api/products'); setProducts(res.data); } catch (e) { }
  };
  const fetchOrders = async () => {
    try { const res = await axios.get('http://localhost:5000/api/orders'); setOrders(res.data); } catch (e) { }
  };
  const fetchUsers = async () => {
    try { const res = await axios.get('http://localhost:5000/api/users'); setUsersList(res.data); } catch (e) { }
  };
  
  const fetchAttendances = async () => {
    try {
      // Dùng safeUserId để đảm bảo luôn truyền đúng ID của nhân viên
      const url = isAdmin ? 'http://localhost:5000/api/attendance' : `http://localhost:5000/api/attendance?employee_id=${safeUserId}`;
      const res = await axios.get(url); setAttendances(res.data);
    } catch (e) { }
  };
  
  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      if (res.data) setSysSettings(res.data);
    } catch (e) { console.error("Lỗi lấy cấu hình:", e); }
  };

  useEffect(() => {
    if (isAdmin || isStaff) { fetchProducts(); fetchOrders(); fetchAttendances(); }
    if (isAdmin) { fetchUsers(); fetchSettings(); }
  }, [user, isAdmin, isStaff]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/settings', sysSettings);
      alert('Đã lưu Cấu hình Thanh toán thành công!');
    } catch (error) { alert('Có lỗi khi lưu cấu hình!'); }
  };

  const handleCheckIn = async () => {
    try {
      const { dateStr, timeStr } = getCurrentDateTime();
      // Gửi đúng tên và ID lên Backend
      await axios.post('http://localhost:5000/api/attendance/checkin', { 
        employee_id: safeUserId, 
        employee_name: safeUserName, 
        date: dateStr, 
        check_in_time: timeStr 
      });
      alert('Đã Check-in vào ca thành công!'); 
      fetchAttendances();
    } catch (e) { alert(e.response?.data?.message || 'Lỗi Check-in!'); }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/checkout/${id}`, { check_out_time: getCurrentDateTime().timeStr });
      alert('Đã Check-out kết thúc ca!'); 
      fetchAttendances();
    } catch (e) { alert('Lỗi Check-out!'); }
  };

  const startEditAttendance = (att) => {
    setEditingAttId(att._id); setAttEditData({ check_in_time: att.check_in_time || '', check_out_time: att.check_out_time || '', status: att.status || 'Đúng giờ', note: att.note || '' });
  };
  const saveEditAttendance = async (id) => {
    try { await axios.put(`http://localhost:5000/api/attendance/admin-edit/${id}`, attEditData); alert('Đã cập nhật giờ công!'); setEditingAttId(null); fetchAttendances(); } catch (e) { alert('Lỗi cập nhật!'); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/products', { ...newProduct, base_price: Number(newProduct.base_price) }); alert('Đã thêm sản phẩm!'); setShowAddForm(false); setNewProduct({product_name: '', category: 'Đồ ăn', base_price: '', description: '', image_url: ''}); fetchProducts(); } catch (e) { alert('Lỗi thêm sản phẩm!'); }
  };
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Xóa món này khỏi hệ thống?')) return;
    try { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } catch (e) {}
  };
  const handleUpdateOrderStatus = async (id, status) => {
    try { await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }); fetchOrders(); } catch (e) {}
  };
  const handleRoleChange = async (id, role) => {
    try { await axios.put(`http://localhost:5000/api/users/${id}/role`, { role }); fetchUsers(); } catch (e) {}
  };

  const completedOrders = orders.filter(o => o.status === 'hoan_tat');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueCOD = completedOrders.filter(o => o.payment_method === 'cod').reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueBank = completedOrders.filter(o => o.payment_method === 'bank').reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const revenueMoMo = completedOrders.filter(o => o.payment_method === 'momo').reduce((sum, o) => sum + (o.total_amount || 0), 0);

  if (!isAdmin && !isStaff) {
    return (
      <div className="text-center py-20"><h2 className="text-2xl text-red-600 font-bold">Từ chối truy cập.</h2><button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-lg">Về trang chủ</button></div>
    );
  }

  const { dateStr: todayStr } = getCurrentDateTime();
  const myTodayRecord = attendances.find(a => a.date === todayStr && a.employee_id === safeUserId);

  return (
    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit sticky top-24">
        <h3 className="font-bold text-lg text-gray-800 mb-4 px-2 border-b pb-2 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary" /> {isAdmin ? 'BẢNG ĐIỀU KHIỂN' : 'MENU NHÂN VIÊN'}
        </h3>
        <div className="space-y-2">
          <button onClick={() => setActiveTab('attendance')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'attendance' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><CalendarCheck className="w-5 h-5 mr-3" /> Chấm công</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><FileText className="w-5 h-5 mr-3" /> Quản lý Đơn hàng</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><Package className="w-5 h-5 mr-3" /> Quản lý Sản phẩm</button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('users')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><Users className="w-5 h-5 mr-3" /> Quản lý Nhân viên</button>
              <button onClick={() => setActiveTab('revenue')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'revenue' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><BarChart3 className="w-5 h-5 mr-3" /> Thống kê Doanh thu</button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'settings' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}><Wallet className="w-5 h-5 mr-3" /> Cấu hình Thanh toán</button>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px] overflow-auto">
        
        {/* ================= TAB CHẤM CÔNG (ĐÃ FIX LỖI ẨN CỘT NHÂN VIÊN) ================= */}
        {activeTab === 'attendance' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Quản lý Chấm công' : 'Chấm công của tôi'}</h2>
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Hôm nay: <b className="text-primary">{todayStr}</b></span>
                {!myTodayRecord ? (
                  <button onClick={handleCheckIn} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition"><Play className="w-4 h-4 mr-1.5" /> Check-in</button>
                ) : !myTodayRecord.check_out_time ? (
                  <button onClick={() => handleCheckOut(myTodayRecord._id)} className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition"><Square className="w-4 h-4 mr-1.5" /> Check-out</button>
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1.5 text-green-600" /> Đã hoàn thành</span>
                )}
              </div>
            </div>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 border-b">
                  {/* LUÔN HIỂN THỊ CỘT NHÂN VIÊN CHO TẤT CẢ MỌI NGƯỜI DỄ NHÌN */}
                  <th className="p-3 font-bold text-gray-600">Nhân viên</th>
                  <th className="p-3 font-bold text-gray-600">Ngày</th>
                  <th className="p-3 font-bold text-gray-600">Giờ vào</th>
                  <th className="p-3 font-bold text-gray-600">Giờ ra</th>
                  <th className="p-3 font-bold text-gray-600">Trạng thái</th>
                  <th className="p-3 font-bold text-gray-600">Ghi chú</th>
                  {isAdmin && <th className="p-3 font-bold text-gray-600">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) => {
                  const isEditing = editingAttId === att._id;
                  return (
                    <tr key={att._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-700">{att.employee_name}</td>
                      <td className="p-3 text-sm">{att.date}</td>
                      <td className="p-3">{isEditing ? <input type="time" value={attEditData.check_in_time} onChange={e => setAttEditData({...attEditData, check_in_time: e.target.value})} className="border p-1 rounded" /> : <span className="text-green-600 font-bold">{att.check_in_time || '--:--'}</span>}</td>
                      <td className="p-3">{isEditing ? <input type="time" value={attEditData.check_out_time} onChange={e => setAttEditData({...attEditData, check_out_time: e.target.value})} className="border p-1 rounded" /> : <span className="text-red-500 font-bold">{att.check_out_time || '--:--'}</span>}</td>
                      <td className="p-3">{isEditing ? (
                        <select value={attEditData.status} onChange={e => setAttEditData({...attEditData, status: e.target.value})} className="border p-1 rounded">
                          <option value="Đúng giờ">Đúng giờ</option><option value="Đi muộn">Đi muộn</option><option value="Về sớm">Về sớm</option><option value="Vắng mặt">Vắng mặt</option>
                        </select>
                      ) : <span className={`px-2 py-1 rounded text-xs font-bold ${att.status==='Đúng giờ' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{att.status}</span>}</td>
                      <td className="p-3">{isEditing ? <input type="text" value={attEditData.note} onChange={e => setAttEditData({...attEditData, note: e.target.value})} className="border p-1 rounded w-32" /> : <span className="text-sm">{att.note}</span>}</td>
                      {isAdmin && <td className="p-3">{isEditing ? <button onClick={() => saveEditAttendance(att._id)} className="text-blue-600"><Save className="w-5 h-5"/></button> : <button onClick={() => startEditAttendance(att)} className="text-gray-500 hover:text-primary"><Edit className="w-5 h-5"/></button>}</td>}
                    </tr>
                  );
                })}
                {attendances.length === 0 && (
                  <tr><td colSpan="7" className="text-center p-4 text-gray-500">Chưa có dữ liệu chấm công.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB ĐƠN HÀNG ================= */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đơn đặt hàng</h2>
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-100 border-b"><th className="p-3">Khách hàng</th><th className="p-3">Chi tiết</th><th className="p-3">Tổng tiền</th><th className="p-3">Thanh toán</th><th className="p-3">Trạng thái</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-3"><p className="font-bold">{order.customer_info?.name}</p><p className="text-xs">{order.customer_info?.phone}</p></td>
                    <td className="p-3 text-sm">{order.items.map((i, idx) => <div key={idx}>{i.product_name} (x{i.quantity})</div>)}</td>
                    <td className="p-3 font-bold text-primary">{order.total_amount?.toLocaleString('vi-VN')} đ</td>
                    <td className="p-3">
                      {order.payment_method === 'cod' ? (
                        <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded font-bold text-xs">Tiền mặt (COD)</span>
                      ) : (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded font-bold text-xs">Đã thanh toán ({order.payment_method})</span>
                      )}
                    </td>
                    <td className="p-3">
                      {order.status === 'cho_duyet' ? (
                        <button onClick={() => handleUpdateOrderStatus(order._id, 'hoan_tat')} className="bg-blue-500 hover:bg-blue-600 transition text-white text-xs px-3 py-1.5 rounded-lg font-bold">Duyệt đơn</button>
                      ) : <span className="text-green-700 font-bold text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-1"/>Hoàn tất</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB SẢN PHẨM ================= */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Danh sách Sản phẩm</h2>
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow">{showAddForm ? 'Đóng' : 'Thêm mới'}</button>
            </div>
            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-gray-50 p-6 rounded-xl border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Tên món</label><input type="text" required value={newProduct.product_name} onChange={e => setNewProduct({...newProduct, product_name: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-bold mb-1">Danh mục</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border rounded-lg"><option>Đồ ăn</option><option>Thức uống</option></select></div>
                <div><label className="block text-sm font-bold mb-1">Giá bán</label><input type="number" required value={newProduct.base_price} onChange={e => setNewProduct({...newProduct, base_price: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-bold mb-1">Link Ảnh</label><input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <button type="submit" className="bg-primary text-white font-bold py-2 rounded-lg col-span-1 md:col-span-2">Lưu món ăn</button>
              </form>
            )}
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-100 border-b"><th className="p-3">Tên món</th><th className="p-3">Danh mục</th><th className="p-3">Giá bán</th><th className="p-3 text-center">Xóa</th></tr></thead>
              <tbody>
                {products.map(item => (
                  <tr key={item._id} className="border-b"><td className="p-3 flex items-center"><img src={item.image_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded mr-3" />{item.product_name}</td><td className="p-3">{item.category}</td><td className="p-3 font-bold text-primary">{item.base_price?.toLocaleString('vi-VN')} đ</td><td className="p-3 text-center"><button onClick={() => handleDeleteProduct(item._id)} className="text-red-500"><Trash2 className="w-5 h-5 mx-auto"/></button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB THỐNG KÊ DOANH THU ================= */}
        {activeTab === 'revenue' && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thống kê Doanh thu & Dòng tiền</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2"><p className="text-sm font-bold text-green-700 uppercase">Tổng Doanh thu</p><BarChart3 className="text-green-500 w-6 h-6" /></div>
                <p className="text-3xl font-extrabold text-green-800">{totalRevenue.toLocaleString('vi-VN')} đ</p>
                <p className="text-xs text-green-600 mt-2">Tất cả đơn Hoàn tất</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2"><p className="text-sm font-bold text-orange-700 uppercase">Tiền mặt (COD)</p><Banknote className="text-orange-500 w-6 h-6" /></div>
                <p className="text-2xl font-extrabold text-orange-800">{revenueCOD.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2"><p className="text-sm font-bold text-blue-700 uppercase">Chuyển khoản</p><QrCode className="text-blue-500 w-6 h-6" /></div>
                <p className="text-2xl font-extrabold text-blue-800">{revenueBank.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-pink-50 border border-pink-200 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2"><p className="text-sm font-bold text-pink-700 uppercase">Ví MoMo</p><Smartphone className="text-pink-500 w-6 h-6" /></div>
                <p className="text-2xl font-extrabold text-pink-800">{revenueMoMo.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex gap-12">
              <div><p className="text-sm text-gray-500 font-medium">Tổng Đơn hàng đã bán</p><p className="text-2xl font-bold text-gray-800">{completedOrders.length} đơn</p></div>
              <div><p className="text-sm text-gray-500 font-medium">Số lượng Món kinh doanh</p><p className="text-2xl font-bold text-gray-800">{products.length} món</p></div>
            </div>
          </div>
        )}

        {/* ================= TAB TÀI KHOẢN VÀ CẤU HÌNH THANH TOÁN ================= */}
        {activeTab === 'users' && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Phân quyền</h2>
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-100 border-b"><th className="p-3">Họ và tên</th><th className="p-3">Email</th><th className="p-3">Trao quyền</th></tr></thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id} className="border-b"><td className="p-3 font-bold">{u.full_name}</td><td className="p-3">{u.email}</td><td className="p-3"><select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="border p-1 rounded"><option value="khach_hang">Khách hàng</option><option value="nhan_vien">Nhân viên</option><option value="admin">Admin</option></select></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cấu hình Cổng Thanh toán</h2>
            <form onSubmit={handleSaveSettings} className="max-w-2xl bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">1. Bật/Tắt các phương thức</h3>
              <div className="space-y-4 mb-8">
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={sysSettings.enable_cod} onChange={(e) => setSysSettings({...sysSettings, enable_cod: e.target.checked})} className="w-5 h-5 text-primary rounded" /><span className="ml-3 font-medium text-gray-800">Cho phép Thanh toán tiền mặt (COD)</span></label>
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={sysSettings.enable_momo} onChange={(e) => setSysSettings({...sysSettings, enable_momo: e.target.checked})} className="w-5 h-5 text-primary rounded" /><span className="ml-3 font-medium text-gray-800">Cho phép Thanh toán Ví MoMo</span></label>
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={sysSettings.enable_bank} onChange={(e) => setSysSettings({...sysSettings, enable_bank: e.target.checked})} className="w-5 h-5 text-primary rounded" /><span className="ml-3 font-medium text-gray-800">Cho phép Khách quét mã Chuyển khoản (VietQR)</span></label>
              </div>
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">2. Cấu hình Ngân hàng (Để tạo VietQR)</h3>
              <div className="space-y-4 mb-6">
                <div><label className="block text-sm font-medium mb-1">Mã Ngân hàng (VD: MB, VCB, CTG...)</label><input type="text" value={sysSettings.bank_info?.bank_id || ''} onChange={(e) => setSysSettings({...sysSettings, bank_info: {...sysSettings.bank_info, bank_id: e.target.value}})} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Số Tài Khoản</label><input type="text" value={sysSettings.bank_info?.account_no || ''} onChange={(e) => setSysSettings({...sysSettings, bank_info: {...sysSettings.bank_info, account_no: e.target.value}})} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Tên Chủ Tài Khoản (Viết HOA, không dấu)</label><input type="text" value={sysSettings.bank_info?.account_name || ''} onChange={(e) => setSysSettings({...sysSettings, bank_info: {...sysSettings.bank_info, account_name: e.target.value}})} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
              </div>
              <button type="submit" className="bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md">Lưu toàn bộ Cấu hình</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;