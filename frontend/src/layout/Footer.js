import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import logoHeader from "../public/assets/logo.jpg";

// Icon Zalo
const ZaloIcon = () => (
    <svg viewBox="0 0 48 48" className="w-5 h-5" fill="currentColor">
        <path d="M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0zm11.5 33.5h-5.2l-3.8-6.3v6.3h-4.3V14.5h4.3v6l3.6-6h5l-4.5 6.8 4.9 12.2zm-15.3 0h-4.3V14.5h4.3v19z"/>
    </svg>
);

// Icon Facebook
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

// Icon Instagram
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Cột 1 - Thông tin */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <img src={logoHeader} alt="Logo" className="w-14 h-14 rounded-xl object-contain bg-white p-1" />
                            <div>
                                <p className="text-xs text-blue-400 font-medium">TÌM ĐỒ THẤT LẠC</p>
                                <h3 className="text-lg font-bold">ĐẠI HỌC TRÀ VINH</h3>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-5">
                            Kênh thông tin tra cứu đồ bị mất của sinh viên và cán bộ Đại học Trà Vinh
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a href="https://zalo.me/" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all hover:scale-110">
                                <ZaloIcon />
                            </a>
                            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer"
                               className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all hover:scale-110">
                                <FacebookIcon />
                            </a>
                            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer"
                               className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 rounded-full flex items-center justify-center transition-all hover:scale-110">
                                <InstagramIcon />
                            </a>
                        </div>
                    </div>

                    {/* Cột 2 - Liên kết trang */}
                    <div>
                        <h4 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-500 rounded"></span>
                            Liên kết
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/do-that-lac" className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Đồ thất lạc
                                </Link>
                            </li>
                            <li>
                                <Link to="/baidang/create" className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Đăng tin
                                </Link>
                            </li>
                            <li>
                                <Link to="/khen-thuong" className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Bảng khen thưởng
                                </Link>
                            </li>
                            <li>
                                <Link to="/lien-he" className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3 - Liên hệ */}
                    <div>
                        <h4 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-500 rounded"></span>
                            Liên hệ
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-gray-400 text-sm">126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-gray-400 text-sm">0986 095 484</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-gray-400 text-sm">hoangyen24042004@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 4 - Báo mất đồ */}
                    <div>
                        <h4 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-500 rounded"></span>
                            Báo mất đồ
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Bạn đã mất đồ? Đăng tin ngay để cộng đồng TVU giúp bạn tìm lại!
                        </p>
                        <Link 
                            to="/baidang/create"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Đăng tin ngay
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2025 Đại học Trà Vinh. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link to="/lien-he" className="text-gray-500 hover:text-white transition-colors">Điều khoản</Link>
                        <Link to="/lien-he" className="text-gray-500 hover:text-white transition-colors">Chính sách</Link>
                        <Link to="/lien-he" className="text-gray-500 hover:text-white transition-colors">Hỗ trợ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
