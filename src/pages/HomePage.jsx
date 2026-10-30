import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flame, Plus, ChevronRight } from 'lucide-react';
import axios from 'axios';

const HomePage = ({ addToCart }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendTitle, setRecommendTitle] = useState('GỢI Ý MÓN YÊU THÍCH CHO BẠN');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Lấy toàn bộ sản phẩm để phục vụ thanh Tìm kiếm
        const productsRes = await axios.get('http://localhost:5000/api/products');
        const productsData = productsRes.data;
        setAllProducts(productsData);

        // 2. Kiểm tra xem người dùng đã đăng nhập chưa để gọi API Gợi ý
        const savedUser = localStorage.getItem('retaste_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.id) {
            const recRes = await axios.get(`http://localhost:5000/api/products/recommend/${parsedUser.id}`);
            setRecommendTitle(recRes.data.title);
            setRecommendedProducts(recRes.data.data);
          } else {
            setRecommendedProducts(productsData.slice(0, 3));
          }
        } else {
          // Nếu khách vãng lai chưa đăng nhập -> Hiển thị 3 món đầu tiên
          setRecommendTitle('GỢI Ý MÓN YÊU THÍCH CHO BẠN');
          setRecommendedProducts(productsData.slice(0, 3));
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
        setError('Không thể kết nối đến máy chủ Backend (Cổng 5000).');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc danh sách món ăn khi người dùng gõ vào ô tìm kiếm
  const isSearching = searchTerm.trim() !== '';
  const displayProducts = isSearching
    ? allProducts.filter((item) =>
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recommendedProducts;

  return (
    <div className="container mx-auto px-4">
      {/* ================= BANNER & THANH TÌM KIẾM ================= */}
      <div className="bg-yellow-100 rounded-3xl p-8 md:p-12 mb-10 text-center shadow-sm">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3 uppercase">
          RETASTE - ĐẶT MÓN NHANH CHÓNG, GỢI Ý ĐÚNG GU!
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Tìm kiếm hoặc để chúng tôi gợi ý món ngon dành riêng cho bạn
        </p>

        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm món ăn (VD: Bánh xèo, Bún đậu, Phở)..."
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-primary focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm text-gray-700"
          />
        </div>
      </div>

      {/* ================= KHU VỰC HIỂN THỊ GỢI Ý / TÌM KIẾM ================= */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center uppercase">
            <Flame className="w-7 h-7 text-primary mr-2" />
            {isSearching
              ? `KẾT QUẢ TÌM KIẾM CHO: "${searchTerm.toUpperCase()}"`
              : recommendTitle}
          </h2>
          <Link
            to="/menu"
            className="text-primary font-bold hover:underline flex items-center text-sm md:text-base"
          >
            Xem toàn bộ thực đơn <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        {/* Trạng thái tải / lỗi / danh sách rỗng */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 font-bold text-lg">
            ⏳ Đang phân tích sở thích và tải món ăn...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-bold">
            ❌ {error}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-1">Database của bạn hiện tại chưa có món ăn nào.</p>
            <p className="text-sm">Hãy dùng API POST hoặc giao diện Admin để thêm món ăn vào MongoDB nhé!</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg">Không tìm thấy món ăn nào phù hợp với "{searchTerm}"</p>
          </div>
        ) : (
          /* Grid hiển thị danh sách món ăn */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/500x300?text=Retaste+Food'}
                    alt={item.product_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-full shadow">
                    {item.category || 'Đồ ăn'}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {item.product_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                    {item.description || 'Món ngon chuẩn vị từ RETASTE.'}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                    <span className="text-xl font-extrabold text-primary">
                      {item.base_price?.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() =>
                        addToCart({
                          id: item._id,
                          name: item.product_name,
                          price: item.base_price,
                          img: item.image_url || 'https://via.placeholder.com/500x300?text=Retaste+Food',
                        })
                      }
                      className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center transition shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Thêm vào giỏ
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