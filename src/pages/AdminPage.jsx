import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, FileText, BarChart3, Settings, Plus, Trash2, X, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    product_name: '', category: 'Đồ ăn', base_price: '', description: '', image_url: ''
  });

  // 1. Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    }
  };

  // 2. Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    }
  };

  // 3. Lấy danh sách người dùng / nhân viên
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsersList(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    if (user?.name === 'Minh Dược' || user?.role === 'admin') {
      fetchProducts();
      fetchOrders();
      fetchUsers();
    }
  }, [user]);

  // Thêm món ăn mới
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...newProduct, base_price: Number(newProduct.base_price) };
      await axios.post('http://localhost:5000/api/products', productData);
      alert('Đã thêm sản phẩm thành công vào Database!');
      setShowAddForm(false);
      setNewProduct({ product_name: '', category: 'Đồ ăn', base_price: '', description: '', image_url: '' });
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert('Có lỗi xảy ra khi thêm món ăn!');
    }
  };

  // Xóa món ăn
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi Database?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      alert('Đã xóa món ăn!');
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert('Không thể xóa món ăn!');
    }
  };

  // Duyệt đơn hàng
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      alert('Đã cập nhật trạng thái đơn hàng!');
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      alert('Lỗi cập nhật trạng thái!');
    }
  };

  // Phân quyền nhân viên / người dùng
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole });
      alert('Đã cập nhật quyền thành công!');
      fetchUsers();
    } catch (error) {
      console.error("Lỗi cập nhật quyền:", error);
      alert('Không thể cập nhật quyền!');
    }
  };

  // Tính toán số liệu Thống kê Doanh thu từ danh sách Đơn hàng
  const completedOrders = orders.filter(o => o.status === 'hoan_tat');
  const pendingOrders = orders.filter(o => o.status === 'cho_duyet');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Thống kê số lượng bán ra theo từng món
  const productSalesMap = {};
  completedOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { quantity: 0, revenue: 0 };
      }
      productSalesMap[item.product_name].quantity += item.quantity;
      productSalesMap[item.product_name].revenue += item.price * item.quantity;
    });
  });
  const topSellingItems = Object.entries(productSalesMap).sort((a, b) => b[1].revenue - a[1].revenue);

  if (user?.name !== 'Minh Dược' && user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-red-600 font-bold">Truy cập bị từ chối. Bạn không có quyền Admin.</h2>
        <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-lg">Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
      {/* Sidebar Menu Admin */}
      <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit">
        <h3 className="font-bold text-lg text-gray-800 mb-4 px-2 border-b pb-2 flex items-center">
          <Settings className="w-5 h-5 mr-2" /> BẢNG ĐIỀU KHIỂN
        </h3>
        <div className="space-y-2">
          <button onClick={() => setActiveTab('products')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}>
            <Package className="w-5 h-5 mr-3" /> Quản lý Sản phẩm
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}>
            <FileText className="w-5 h-5 mr-3" /> Quản lý Đơn hàng
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}>
            <Users className="w-5 h-5 mr-3" /> Quản lý Nhân viên
          </button>
          <button onClick={() => setActiveTab('revenue')} className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition ${activeTab === 'revenue' ? 'bg-primary text-white font-bold shadow-md' : 'text-gray-600 hover:bg-orange-50'}`}>
            <BarChart3 className="w-5 h-5 mr-3" /> Thống kê Doanh thu
          </button>
        </div>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        
        {/* ================= 1. TAB QUẢN LÝ SẢN PHẨM ================= */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Danh sách Sản phẩm ({products.length})</h2>
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold shadow">
                {showAddForm ? <X className="w-4 h-4 mr-1"/> : <Plus className="w-4 h-4 mr-1"/>}
                {showAddForm ? 'Đóng' : 'Thêm mới'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                <h3 className="font-bold text-lg mb-4 text-primary">Thêm Món Ăn Mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn (*)</label>
                    <input type="text" required value={newProduct.product_name} onChange={(e) => setNewProduct({...newProduct, product_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="VD: Bún Đậu Mắm Tôm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="Đồ ăn">Đồ ăn</option>
                      <option value="Thức uống">Thức uống</option>
                      <option value="Combo">Combo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) (*)</label>
                    <input type="number" required min="0" value={newProduct.base_price} onChange={(e) => setNewProduct({...newProduct, base_price: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="VD: 35000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
                    <input type="text" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="VD: https://link-anh.com/anh.jpg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" rows="2" placeholder="Mô tả món ăn..."></textarea>
                  </div>
                </div>
                <button type="submit" className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Lưu món ăn</button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 font-bold text-gray-600">Tên món</th>
                    <th className="p-3 font-bold text-gray-600">Danh mục</th>
                    <th className="p-3 font-bold text-gray-600">Giá bán</th>
                    <th className="p-3 font-bold text-gray-600">Trạng thái</th>
                    <th className="p-3 font-bold text-gray-600 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-4 text-gray-500">Chưa có món ăn nào trong CSDL.</td></tr>
                  ) : (
                    products.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium flex items-center">
                          <img src={item.image_url || 'https://via.placeholder.com/40'} alt="thumb" className="w-10 h-10 rounded object-cover mr-3" />
                          {item.product_name}
                        </td>
                        <td className="p-3 text-sm text-gray-500">{item.category}</td>
                        <td className="p-3 text-primary font-bold">{item.base_price?.toLocaleString('vi-VN')} đ</td>
                        <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Đang bán</span></td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleDeleteProduct(item._id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 2. TAB QUẢN LÝ ĐƠN HÀNG ================= */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đơn đặt hàng ({orders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 font-bold text-gray-600">Mã Đơn</th>
                    <th className="p-3 font-bold text-gray-600">Khách hàng</th>
                    <th className="p-3 font-bold text-gray-600">Chi tiết món</th>
                    <th className="p-3 font-bold text-gray-600">Tổng tiền</th>
                    <th className="p-3 font-bold text-gray-600">Trạng thái</th>
                    <th className="p-3 font-bold text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-4 text-gray-500">Chưa có đơn hàng nào.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-sm text-gray-500">#{order._id.substring(18, 24).toUpperCase()}</td>
                        <td className="p-3">
                          <p className="font-bold">{order.customer_info?.name}</p>
                          <p className="text-xs text-gray-500">{order.customer_info?.phone}</p>
                          <p className="text-xs text-gray-400">{order.customer_info?.address}</p>
                        </td>
                        <td className="p-3 text-sm">
                          {order.items.map((i, idx) => (
                            <div key={idx}>- {i.product_name} (x{i.quantity})</div>
                          ))}
                        </td>
                        <td className="p-3 font-bold text-primary">{order.total_amount?.toLocaleString('vi-VN')} đ</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'cho_duyet' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {order.status === 'cho_duyet' ? 'Chờ duyệt' : 'Hoàn tất'}
                          </span>
                        </td>
                        <td className="p-3">
                          {order.status === 'cho_duyet' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order._id, 'hoan_tat')}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg shadow font-bold"
                            >
                              Duyệt đơn
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 3. TAB QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN ================= */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Tài khoản & Trao quyền ({usersList.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 font-bold text-gray-600">Họ và tên</th>
                    <th className="p-3 font-bold text-gray-600">Email</th>
                    <th className="p-3 font-bold text-gray-600">Vai trò hiện tại</th>
                    <th className="p-3 font-bold text-gray-600">Trao quyền</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-4 text-gray-500">Chưa có tài khoản nào đăng ký trong CSDL.</td></tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-800">{u.full_name}</td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                            u.role === 'nhan_vien' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role === 'admin' ? 'Quản trị viên (Admin)' : u.role === 'nhan_vien' ? 'Nhân viên' : 'Khách hàng'}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="khach_hang">Khách hàng</option>
                            <option value="nhan_vien">Nhân viên</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 4. TAB THỐNG KÊ DOANH THU ================= */}
        {activeTab === 'revenue' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Báo cáo & Thống kê Doanh thu</h2>
            
            {/* 3 Thẻ chỉ số tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Doanh thu thực nhận (Đã duyệt)</p>
                  <p className="text-2xl font-extrabold text-green-800">{totalRevenue.toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-green-600 mt-1">{completedOrders.length} đơn hoàn tất</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium mb-1">Doanh thu chờ duyệt</p>
                  <p className="text-2xl font-extrabold text-yellow-800">{pendingRevenue.toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-yellow-600 mt-1">{pendingOrders.length} đơn đang chờ</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>

              <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium mb-1">Tổng số đơn đặt hàng</p>
                  <p className="text-2xl font-extrabold text-primary">{orders.length} đơn</p>
                  <p className="text-xs text-orange-600 mt-1">Trên toàn hệ thống</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Biểu đồ xếp hạng doanh thu theo món ăn */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Thống kê doanh thu theo từng món ăn (Đơn đã duyệt)</h3>
              {topSellingItems.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Chưa có đơn hàng nào hoàn tất. Hãy bấm "Duyệt đơn" ở tab Quản lý Đơn hàng để xem thống kê!</p>
              ) : (
                <div className="space-y-4">
                  {topSellingItems.map(([name, stats], index) => {
                    const percent = totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0;
                    return (
                      <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-800">{index + 1}. {name} <span className="text-sm font-normal text-gray-500">(Đã bán: {stats.quantity})</span></span>
                          <span className="font-bold text-primary">{stats.revenue.toLocaleString('vi-VN')} đ ({percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${Math.max(percent, 5)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;