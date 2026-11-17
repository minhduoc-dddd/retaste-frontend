import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MapPin, Clock, Award, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 mt-auto w-full border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          {/* Cột 1: Thương hiệu */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-md">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-wider text-white">
                RETASTE
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Hệ thống đặt món ăn & thức uống thông minh tích hợp thuật toán gợi ý cá nhân hóa theo sở thích thực khách và thanh toán đa kênh (VietQR, MoMo, COD).
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-400" /> 07:00 - 22:30
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-400" /> Đà Nẵng, Việt Nam
              </span>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="md:pl-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Khám phá thực đơn
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-orange-400 transition">
                  Trang chủ & Gợi ý thông minh
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition">
                  Thực đơn món ngon mỗi ngày
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition">
                  Giỏ hàng & Thanh toán VietQR / MoMo
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition">
                  Tài khoản thành viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin Đồ án CDIO */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/70">
            <div className="flex items-center gap-2 text-orange-400 font-extrabold text-sm uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>ĐỒ ÁN CDIO - SE 447 C | NHÓM 09</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 font-medium">
              GVHD: <strong className="text-slate-200">ThS. Phan Long</strong> — Đại học Duy Tân (03/2026)
            </p>
            <div className="space-y-1 text-xs text-slate-300 border-t border-slate-700/70 pt-3">
              <p className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" /> Thành viên thực hiện:
              </p>
              <div className="grid grid-cols-2 gap-1.5 font-medium">
                <span>1. Đỗ Minh Dược</span>
                <span>2. Phạm Trường Phi Long</span>
                <span>3. Trương Văn Thuận</span>
                <span>4. Phan Hoàng Phúc</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© 2026 RETASTE Restaurant System. All rights reserved.</p>
          <p>Developed with React, Tailwind CSS, Node.js & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;