import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';

const MenuPage = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Đồ ăn', 'Thức uống', 'Combo'];
  
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách món ăn từ MongoDB thông qua API Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setMenuItems(response.data);
      } catch (error) {
        console.error("Lỗi lấy thực đơn:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredItems = activeCategory === 'Tất cả' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 uppercase mb-2">Thực Đơn Của Chúng Tôi</h2>
        <div className="w-24 h-1 bg-primary rounded"></div>
      </div>

      {/* Thanh chọn danh mục */}
      <div className="flex justify-center space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`px-6 py-2 rounded-full font-bold transition shadow whitespace-nowrap ${
              activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="text-center py-10 text-gray-500 font-bold text-xl">⏳ Đang tải thực đơn từ CSDL...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xl font-bold mb-2">Chưa có món ăn nào trong thực đơn.</p>
          <p className="text-sm">Hãy đăng nhập tài khoản Admin và vào trang quản trị để thêm món mới nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col group">
              <div className="h-44 overflow-hidden relative bg-gray-100">
                <img 
                  src={item.image_url || 'https://placehold.co/500x300?text=RETASTE'} 
                  alt={item.product_name} 
                  onError={(e) => { e.target.src = 'https://placehold.co/500x300?text=RETASTE'; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                />
                <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2.5 py-1 rounded shadow">
                  {item.category}
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{item.product_name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow">{item.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-primary">{item.base_price?.toLocaleString('vi-VN')} đ</span>
                  <button 
                    onClick={() => addToCart({
                      id: item._id,
                      name: item.product_name,
                      price: item.base_price,
                      img: item.image_url || 'https://placehold.co/500x300?text=RETASTE'
                    })}
                    className="bg-gray-100 text-gray-700 hover:bg-primary hover:text-white p-2 rounded-lg transition shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;