import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoHeader from "../public/assets/logo.jpg";
import { AuthContext } from '../core/AuthContext';
import { ChevronDown, CircleUser, FileSearch, LayoutDashboard, Settings, MessageSquare } from 'lucide-react';
import { CircleQuestionMark } from 'lucide-react';
import { FolderInput } from 'lucide-react';
import { Users } from 'lucide-react';

const makeIcon = (label) => (
    <span aria-hidden className="inline-block w-6 text-center">{label}</span>
);

const navItems = [
    {
        icon: <LayoutDashboard />,
        name: 'Dashboard',
        path: '/admin'
    },
    {
        icon: <CircleQuestionMark />,
        name: 'Đồ thất lạc',
        subItems: [
            { name: 'Danh sách đồ thất lạc', icon: makeIcon('•'), path: '/admin/lost-items' },
            { name: 'Thêm đồ thất lạc', icon: makeIcon('•'), path: '/admin/lost-items/add' },
            { name: 'Tìm kiếm nâng cao', icon: makeIcon('•'), path: '/admin/lost-items/search' }
        ]
    },
    {
        icon: <FileSearch />,
        name: 'Đã tìm thấy',
        subItems: [
            { name: 'Danh sách đã trả', icon: makeIcon('•'), path: '/admin/found-items' },
            { name: 'Thống kê', icon: makeIcon('•'), path: '/admin/found-items/stats' }
        ]
    },
    {
        icon: <FolderInput></FolderInput>,
        name: 'Báo cáo',
        subItems: [
            { name: 'Báo cáo tháng', icon: makeIcon('•'), path: '/admin/reports' },
            { name: 'Thống kê tổng hợp', icon: makeIcon('•'), path: '/admin/reports/summary' },
            { name: 'Xuất báo cáo', icon: makeIcon('•'), path: '/admin/reports/export' }
        ]
    },
    {
        icon: <MessageSquare />,
        name: 'Tin nhắn liên hệ',
        path: '/admin/contacts'
    },
];

const othersItems = [
    {
        icon: <Users />,
        name: 'Quản lý người dùng',
        subItems: [
            { name: 'Phân quyền', icon: makeIcon('•'), path: '/admin/roles' }
        ]
    },
    {
        icon: <Settings />,
        name: 'Cấu hình',
        subItems: [
            { name: 'Thông tin trường', icon: makeIcon('•'), path: '/admin/settings/school' },
            { name: 'Danh mục', icon: makeIcon('•'), path: '/admin/settings/categories' },
            { name: 'Vị trí', icon: makeIcon('•'), path: '/admin/settings/locations' }
        ]
    },
    {
        icon: <CircleUser />,
        name: 'Tài khoản',
        subItems: [
            { name: 'Thông tin cá nhân', icon: makeIcon('•'), path: '/admin/profile' },
            { name: 'Đổi mật khẩu', icon: makeIcon('•'), path: '/admin/profile/password' },
            { name: 'Đăng xuất', icon: makeIcon('•'), path: '/logout' }
        ]
    },
];

export default function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(true);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [subMenuHeight, setSubMenuHeight] = useState({});
    const subMenuRefs = useRef({});
    const { logout } = useContext(AuthContext);
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
        <ul className="flex flex-col gap-2">
            {items.map((nav, idx) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <div>
                            <button
                                onClick={() => handleSubmenuToggle(idx, menuType)}
                                className={`flex items-center gap-3 w-full p-2 rounded  hover:bg-[#246188]`}
                            >
                                <span className="w-6">{nav.icon}</span>
                                <span className="flex-1 text-sm text-start">{nav.name}</span>
                                <span className={`ml-auto transition-transform ${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx ? 'rotate-180' : ''}`}><ChevronDown className='w-4' /></span>
                            </button>

                            <div
                                ref={(el) => (subMenuRefs.current[`${menuType}-${idx}`] = el)}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height: openSubmenu && openSubmenu.type === menuType && openSubmenu.index === idx ? `${subMenuHeight[`${menuType}-${idx}`] || 0}px` : '0px',
                                }}
                            >
                                <ul className="pl-8 pt-2 pb-2">
                                    {nav.subItems.map((s) => (
                                        <li key={s.name}>
                                            {
                                                s.path === '/logout' ? (
                                                    <button onClick={handleLogout} type="submit" className={`block w-full text-left p-1 rounded hover:bg-[#246188] text-sm ${isActive(s.path) ? 'bg-[#246188] font-semibold ' : ''}`}>
                                                        {s.icon} {s.name}
                                                    </button>
                                                ) : (
                                                    <Link to={s.path} className={`block p-1 rounded hover:bg-[#246188] text-sm ${isActive(s.path) ? 'bg-[#246188] font-semibold ' : ''}`}>
                                                        {s.icon} {s.name}
                                                    </Link>
                                                )
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <Link to={nav.path} className={`flex items-center gap-3 p-2 rounded hover:bg-[#246188] ${isActive(nav.path) ? 'font-semibold bg-[#246188]' : ''}`}>
                            <span className="w-6">{nav.icon}</span>
                            <span className="text-sm">{nav.name}</span>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside className={`bg-[#3989bd] border-r border-gray-200 h-screen p-4 text-white`} style={{ width: isExpanded ? 260 : 90 }}>
            <div className="flex items-center justify-between mb-4">
                <Link to="/admin" className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoHeader}
                            alt="logo"
                            className="w-14 h-14 object-contain rounded-lg"
                        />
                        <span>Xin chào...</span>
                    </div>
                </Link>
            </div>
            <hr></hr>
            <nav className="overflow-y-auto h-[calc(100%-100px)] mt-3">
                <div className="mb-6">
                    <h3 className="text-xs text-white uppercase mb-2 font-bold">Menu</h3>
                    {renderMenuItems(navItems, 'main')}
                </div>

                <div>
                    <h3 className="text-xs text-white uppercase mb-2 font-bold">Others</h3>
                    {renderMenuItems(othersItems, 'others')}
                </div>
            </nav>

            <div className="mt-auto pt-4 text-center">
                {isExpanded && (
                    <div className="text-xs text-gray-500">© {new Date().getFullYear()} QLVTK-DTL</div>
                )}
            </div>
        </aside>
    );
}
