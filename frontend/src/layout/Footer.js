import { Mail, MapPin, Phone, Send } from "lucide-react";
import logoHeader from "../public/assets/logo.jpg";
export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Cột 1 */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <img src={logoHeader} className="w-14 h-14 object-contain" />
            <div>
              <p className="text-sm text-gray-300">TÌM ĐỒ THẬT LẠC</p>
              <h3 className="text-lg font-semibold">ĐẠI HỌC TRÀ VINH</h3>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Kênh thông tin tra cứu di đồ bị mất của học sinh, sinh viên Đại học Trà Vinh
          </p>

          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center space-x-3">
              <Mail className="text-red-500 w-5 h-5" />
              <span>travinh@gmail.edu.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <MapPin className="text-red-500 w-5 h-5" />
              <span>
                126 Đuong Nguyen Thien Thanh Phuong 5 87110 Trà Vinh
              </span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="text-red-500 w-5 h-5" />
              <span>+84 294 3855 246</span>
            </li>
          </ul>
        </div>

        {/* Cột 2 */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Tổng quan</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white">Trang chủ</a></li>
            <li><a href="#" className="hover:text-white">Đăng tin</a></li>
            <li><a href="#" className="hover:text-white">Liên hệ</a></li>
            <li><a href="#" className="hover:text-white">Hướng dẫn sử dụng</a></li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white">Đồ thất lạc</a></li>
            <li><a href="#" className="hover:text-white">Đồ nhặt được</a></li>

          </ul>
        </div>

        {/* Cột 4 */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Đăng ký để nhận tin</h4>
          <p className="text-gray-400 text-sm mb-4">
            Đăng ký với chúng tôi để được theo dõi các tin tức mới nhất
          </p>

          <div className="flex">
            <input
              type="email"
              placeholder="Email"
              className="bg-[#1e293b] text-gray-300 px-4 py-3 rounded-l-md w-full focus:outline-none"
            />
            <button className="bg-red-600 px-4 rounded-r-md hover:bg-red-700">
              <Send className="text-white w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2025 | Đại học Trà Vinh</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white">Điều khoản & Chính sách</a>
            <a href="#" className="hover:text-white">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
