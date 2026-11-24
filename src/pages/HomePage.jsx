import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Flame,
  Plus,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Star,
  X,
  Utensils
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

const HomePage = ({ addToCart, user }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendTitle, setRecommendTitle] = useState('GỢI Ý MÓN NGON PHỔ BIẾN CHO BẠN');
  const [aiInsight, setAiInsight] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuickTag, setSelectedQuickTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Lấy toàn bộ sản phẩm để phục vụ thanh Tìm kiếm & Khám phá
        const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
        const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
        setAllProducts(productsData);

        // 2. Kiểm tra xem người dùng đã đăng nhập chưa để gọi API Gợi ý
        const currentUserId = user?.id || user?._id;
        if (currentUserId) {
          try {
            const recRes = await axios.get(
              `${API_BASE_URL}/api/products/recommend/${currentUserId}`
            );
            setRecommendTitle(recRes.data.title || 'GỢI Ý MÓN YÊU THÍCH CHO BẠN');
            setRecommendedProducts(
              recRes.data.data?.length ? recRes.data.data : productsData.slice(0, 6)
            );
          } catch {
            setRecommendTitle('GỢI Ý MÓN YÊU THÍCH CHO BẠN');
            setRecommendedProducts(productsData.slice(0, 6));
          }
        } else {
          setRecommendTitle('GỢI Ý MÓN NGON PHỔ BIẾN CHO BẠN');
          setRecommendedProducts(productsData.slice(0, 6));
        }

        // 3. Lấy phân tích gợi ý AI theo khung giờ & khẩu vị
        try {
          const aiRes = await axios.get(
            `${API_BASE_URL}/api/ai/smart-recommend${
              currentUserId ? `?userId=${currentUserId}` : ''
            }`
          );
          if (aiRes.data?.insight) {
            setAiInsight(aiRes.data.insight);
          }
        } catch {}
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
        setError('Không thể kết nối đến máy chủ Backend (Cổng 5000).');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const activeQuery = (searchTerm || selectedQuickTag).trim();
  const isSearching = activeQuery !== '';

  const displayProducts = isSearching
    ? allProducts.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(activeQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(activeQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(activeQuery.toLowerCase())
      )
    : recommendedProducts;

  const quickTags = ['Phở', 'Bún đậu', 'Bánh xèo', 'Cơm tấm', 'Trà đào', 'Combo'];

  return (
    <div className="container mx-auto px-4 space-y-12">
      {/* ================= HERO BANNER & THANH TÌM KIẾM ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white p-8 md:p-14 shadow-xl border border-blue-900/50">
        {/* Decorative glowing circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ thống gợi ý ẩm thực thông minh RETASTE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Đặt Món Nhanh Chóng,{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Gợi Ý Đúng Gu!
            </span>
          </h1>

          <p className="text-slate-300 mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Thưởng thức hương vị ẩm thực chuẩn vị mỗi ngày. Tự động phân tích sở thích đặt món và gợi ý thực đơn dành riêng cho bạn.
          </p>

          {/* Thanh tìm kiếm */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedQuickTag) setSelectedQuickTag('');
              }}
              placeholder="Tìm món ngon bạn thèm hôm nay (VD: Phở bò, Bún đậu, Trà đào, Combo)..."
              className="w-full pl-13 pr-12 py-4 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/40 transition text-sm md:text-base"
              style={{ paddingLeft: '3.25rem' }}
            />
            {(searchTerm || selectedQuickTag) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedQuickTag('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Từ khóa gợi ý nhanh */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Tìm nhanh:</span>
            {quickTags.map((tag) => {
              const active = selectedQuickTag === tag || searchTerm.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => {
                    if (active) {
                      setSelectedQuickTag('');
                      setSearchTerm('');
                    } else {
                      setSelectedQuickTag(tag);
                      setSearchTerm(tag);
                    }
                  }}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition border ${
                    active
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TIỆN ÍCH NỔI BẬT ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Gợi ý món đúng gu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cá nhân hóa thực đơn từ lịch sử thưởng thức của bạn
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Chế biến & Giao siêu tốc</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Món ăn luôn nóng hổi, giữ trọn hương vị truyền thống
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Thanh toán đa phương thức</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ Tiền mặt COD, Ví điện tử MoMo và Quét mã VietQR
            </p>
          </div>
        </div>
      </div>

      {/* ================= KHU VỰC HIỂN THỊ GỢI Ý / TÌM KIẾM ================= */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
              <Flame className="w-4 h-4" />
              <span>{isSearching ? 'Kết quả tra cứu' : user ? 'Gợi ý cá nhân hóa' : 'Thực đơn nổi bật'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 uppercase tracking-tight">
              {isSearching
                ? `KẾT QUẢ TÌM KIẾM CHO "${activeQuery.toUpperCase()}" (${displayProducts.length})`
                : recommendTitle}
            </h2>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition w-fit"
          >
            <span>Xem toàn bộ thực đơn</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Thanh AI Insight theo khung giờ & lịch sử ăn uống */}
        {!isSearching && aiInsight && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 via-sky-50/70 to-white border border-blue-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary block">
                Gợi ý thông minh bởi RETASTE AI
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                {aiInsight}
              </p>
            </div>
          </div>
        )}

        {/* Trạng thái tải / lỗi / danh sách rỗng */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft animate-pulse"
              >
                <div className="h-48 bg-slate-200 rounded-2xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-full mb-4" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-slate-200 rounded w-24" />
                  <div className="h-10 bg-slate-200 rounded-xl w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100 p-6">
            <p className="text-red-600 font-bold text-lg mb-2">❌ {error}</p>
            <p className="text-sm text-slate-600">
              Hãy đảm bảo máy chủ Backend (`node server.js`) và MongoDB đang hoạt động.
            </p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-soft p-8">
            <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-bold text-slate-700 mb-1">
              Thực đơn hiện tại chưa có món ăn nào.
            </p>
            <p className="text-sm text-slate-500">
              Hãy đăng nhập bằng tài khoản Quản trị viên (Admin) để thêm món mới nhé!
            </p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-soft p-8">
            <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-bold text-slate-700 mb-2">
              Không tìm thấy món ăn nào phù hợp với "{activeQuery}"
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedQuickTag('');
              }}
              className="mt-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          /* Grid hiển thị danh sách món ăn */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl shadow-soft border border-slate-200/70 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group"
              >
                <div className="h-52 overflow-hidden relative bg-slate-100">
                  <img
                    src={item.image_url || FALLBACK_FOOD_IMG}
                    alt={item.product_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_FOOD_IMG;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {item.category || 'Đồ ăn'}
                    </span>
                    {item.best_seller && (
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" /> Best Seller
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-1.5 line-clamp-1 group-hover:text-primary transition">
                    {item.product_name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-5 line-clamp-2 flex-grow leading-relaxed">
                    {item.description || 'Món ngon chuẩn vị được chế biến tươi mới mỗi ngày tại RETASTE.'}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Giá bán</span>
                      <span className="text-xl font-extrabold text-primary">
                        {Number(item.base_price || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addToCart({
                          _id: item._id,
                          id: item._id,
                          product_name: item.product_name,
                          name: item.product_name,
                          base_price: item.base_price,
                          price: item.base_price,
                          image_url: item.image_url || FALLBACK_FOOD_IMG,
                          img: item.image_url || FALLBACK_FOOD_IMG
                        })
                      }
                      className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold flex items-center gap-1.5 transition shadow-md shadow-amber-500/25 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;