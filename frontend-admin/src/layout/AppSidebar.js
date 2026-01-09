import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../core/AuthContext';
import { ChevronDown, CircleUser, LayoutDashboard, Settings, MessageSquare, CircleHelp, Users, AlertTriangle, LogOut, FileText, PlusCircle, CheckCircle, Shield, Building, MapPin, Tag, Key } from 'lucide-react';
import { getImageUrl } from '../utils/constant';

const navItems = [
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        name: 'Dashboard',
        path: '/admin'
    },
    {
        icon: <FileText className="w-5 h-5" />,
        name: 'Bài đăng',
        subItems: [
            { name: 'Danh sách bài đăng', icon: <CircleHelp className="w-4 h-4" />, path: '/admin/lost-items' },
            { name: 'Đăng tin mới', icon: <PlusCircle className="w-4 h-4" />, path: '/admin/admin-posts/create' },
            { name: 'Đã trả đồ', icon: <CheckCircle className="w-4 h-4" />, path: '/admin/returned-items' }
        ]
    },
    {
        icon: <MessageSquare className="w-5 h-5" />,
        name: 'Tin nhắn liên hệ',
        path: '/admin/contacts'
    },
    {
        icon: <AlertTriangle className="w-5 h-5" />,
        name: 'Tố cáo bài đăng',
        path: '/admin/reports'
    },
];

const othersItems = [
    {
        icon: <Users className="w-5 h-5" />,
        name: 'Quản lý người dùng',
        subItems: [
            { name: 'Phân quyền', icon: <Shield className="w-4 h-4" />, path: '/admin/roles' }
        ]
    },
    {
        icon: <Settings className="w-5 h-5" />,
        name: 'Cấu hình',
        subItems: [
            { name: 'Thông tin trường', icon: <Building className="w-4 h-4" />, path: '/admin/settings/school' },
            { name: 'Danh mục', icon: <Tag className="w-4 h-4" />, path: '/admin/settings/categories' },
            { name: 'Vị trí', icon: <MapPin className="w-4 h-4" />, path: '/admin/settings/locations' }
        ]
    },
    {
        icon: <CircleUser className="w-5 h-5" />,
        name: 'Tài khoản',
        subItems: [
            { name: 'Thông tin cá nhân', icon: <CircleUser className="w-4 h-4" />, path: '/admin/profile' },
            { name: 'Đổi mật khẩu', icon: <Key className="w-4 h-4" />, path: '/admin/profile/password' },
            { name: 'Đăng xuất', icon: <LogOut className="w-4 h-4" />, path: '/logout' }
        ]
    },
];


export default function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isExpanded] = useState(true);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [subMenuHeight, setSubMenuHeight] = useState({});
    const subMenuRefs = useRef({});
    const { logout, user } = useContext(AuthContext);
    
    const isActive = useCallback((path) => {
        if (path === '/logout') return false;
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    }, [location.pathname]);
    
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    
    useEffect(() => {
        let found = false;
        [['main', navItems], ['others', othersItems]].forEach(([type, items]) => {
            items.forEach((nav, idx) => {
                if (nav.subItems) {
                    nav.subItems.forEach((sub) => {
                        if (isActive(sub.path)) {
                            setOpenSubmenu({ type, index: idx });
                            found = true;
                        }
                    });
                }
            });
        });
        if (!found) setOpenSubmenu(null);
    }, [location.pathname, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            const el = subMenuRefs.current[key];
            if (el) setSubMenuHeight((h) => ({ ...h, [key]: el.scrollHeight }));
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index, menuType) => {
        setOpenSubmenu((prev) => {
            if (prev && prev.type === menuType && prev.index === index) return null;
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items, menuType) => (
        <ul className="flex flex-col gap-1">
            {items.map((nav, idx) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <div>
                            <button
                                onClick={() => handleSubmenuToggle(idx, menuType)}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                                    openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx 
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className={`${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {nav.icon}
                                </span>
                                <span className="flex-1 text-sm font-medium text-left">{nav.name}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                            </button>

                            <div
                                ref={(el) => (subMenuRefs.current[`${menuType}-${idx}`] = el)}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height: openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx ? `${subMenuHeight[`${menuType}-${idx}`] || 0}px` : '0px',
                                }}
                            >
                                <ul className="ml-4 pl-4 border-l-2 border-gray-200 py-2 space-y-1">
                                    {nav.subItems.map((s) => (
                                        <li key={s.name}>
                                            {s.path === '/logout' ? (
                                                <button 
                                                    onClick={handleLogout} 
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    {s.icon}
                                                    <span>{s.name}</span>
                                                </button>
                                            ) : (
                                                <Link 
                                                    to={s.path} 
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                                                        isActive(s.path) 
                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30' 
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {s.icon}
                                                    <span>{s.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <Link 
                            to={nav.path} 
                            target={nav.external ? '_blank' : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive(nav.path) 
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className={isActive(nav.path) ? 'text-white' : 'text-gray-500'}>{nav.icon}</span>
                            <span className="text-sm font-medium">{nav.name}</span>
                            {nav.external && <span className="ml-auto text-xs opacity-60">↗</span>}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside className="bg-white border-r border-gray-200 h-screen flex flex-col shadow-xl" style={{ width: isExpanded ? 280 : 90 }}>
            {/* Header với Avatar */}
            <div className="p-5 border-b border-gray-100">
                <Link to="/admin" className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                            {user?.avatar ? (
                                <img
                                    src={getImageUrl(user.avatar)}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-xl font-bold">
                                    {user?.fullname?.charAt(0) || 'A'}
                                </span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Xin chào,</p>
                        <p className="font-bold text-gray-800 truncate">{user?.fullname || 'Admin'}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full mt-1">
                            <Shield className="w-3 h-3" />
                            Admin
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Menu chính</h3>
                    {renderMenuItems(navItems, 'main')}
                </div>

                <div>
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cài đặt</h3>
                    {renderMenuItems(othersItems, 'others')}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">© {new Date().getFullYear()}</p>
                    <p className="text-sm font-semibold text-gray-700">QLVTK-ĐTL</p>
                    <p className="text-xs text-gray-500">Đại học Trà Vinh</p>
                </div>
            </div>
        </aside>
    );
}
