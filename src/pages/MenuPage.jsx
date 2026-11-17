import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Star, Utensils, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const FALLBACK_FOOD_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
const DEFAULT_CATEGORIES = ['Tất cả', 'Đồ ăn', 'Thức uống', 'Combo'];

const MenuPage = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách món ăn từ MongoDB thông qua API Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setMenuItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Lỗi lấy thực đơn:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const dynamicCats = menuItems
      .map((i) => i.category)
      .filter((c) => c && !DEFAULT_CATEGORIES.includes(c));
    return [...DEFAULT_CATEGORIES, ...new Set(dynamicCats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let list = menuItems.filter((item) => {
      const matchCat = activeCategory === 'Tất cả' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.product_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    } else if (sortBy === 'bestseller') {
      list = [...list].sort((a, b) => Number(Boolean(b.best_seller)) - Number(Boolean(a.best_seller)));
    }
    return list;
  }, [menuItems, activeCategory, searchQuery, sortBy]);

  return (
    <div className="container mx-auto px-4">
      {/* Header Thực đơn */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-orange-50 px-3.5 py-1.5 rounded-full">
          Thực đơn tươi ngon mỗi ngày
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 uppercase mt-3 mb-2">
          Thực Đơn Của Chúng Tôi
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Khám phá các món ăn truyền thống, thức uống thanh mát và combo tiết kiệm tại RETASTE
        </p>
      </div>

      {/* Thanh công cụ: Danh mục + Tìm kiếm + Sắp xếp */}
      <div className="bg-white rounded-3xl p-4 md:p-5 shadow-soft border border-slate-200/70 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Chọn danh mục */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {categories.map((cat) => {
              const count =
                cat === 'Tất cả'
                  ? menuItems.length
                  : menuItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-md shadow-orange-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md font-extrabold ${
                      activeCategory === cat
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tìm kiếm & Sắp xếp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên món ăn..."
                className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="bestseller">Ưa chuộng nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách món ăn */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft animate-pulse"
            >
              <div className="h-44 bg-slate-200 rounded-2xl mb-4" />
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-4" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-slate-200 rounded w-20" />
                <div className="h-9 bg-slate-200 rounded-xl w-9" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white rounded-3xl shadow-soft border border-slate-200/70 p-8">
          <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-xl font-bold text-slate-700 mb-2">
            Không tìm thấy món ăn nào trong mục này.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm nhé!
          </p>
          {(activeCategory !== 'Tất cả' || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('Tất cả');
                setSearchQuery('');
              }}
              className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition"
            >
              Xem tất cả thực đơn
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl shadow-soft border border-slate-200/70 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100">
                <img
                  src={item.image_url || FALLBACK_FOOD_IMG}
                  alt={item.product_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_FOOD_IMG;
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </span>
                  {item.best_seller && (
                    <span className="bg-amber-400 text-slate-900 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-900" /> Hot
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-base font-extrabold text-slate-800 mb-1 line-clamp-1 group-hover:text-primary transition">
                  {item.product_name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-grow leading-relaxed">
                  {item.description || 'Món ngon chuẩn vị được yêu thích tại RETASTE.'}
                </p>
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
                  <span className="font-extrabold text-lg text-primary">
                    {Number(item.base_price || 0).toLocaleString('vi-VN')} đ
                  </span>
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
                    className="bg-orange-50 text-primary hover:bg-primary hover:text-white active:scale-95 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Thêm
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