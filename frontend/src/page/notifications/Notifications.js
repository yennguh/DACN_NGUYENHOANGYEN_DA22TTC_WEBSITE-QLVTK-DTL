import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../api/notifications.api';
import { AuthContext } from '../../core/AuthContext';

const Notifications = () => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [token, navigate, filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 50,
                ...(filter === 'unread' && { isRead: 'false' }),
                ...(filter === 'read' && { isRead: 'true' })
            };
            const result = await fetchNotifications(params);
            if (result) {
                const items = Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.notifications)
                        ? result.notifications
                        : [];
                setNotifications(items);
                const unread = typeof result.unreadCount === 'number'
                    ? result.unreadCount
                    : result.meta?.unreadCount;
                setUnreadCount(unread || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            fetchData();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            fetchData();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post_approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'post_rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'item_found':
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification?.isRead) {
            handleMarkAsRead(notification._id);
        }
        
        const type = notification?.type || '';
        if (notification?.relatedId && type.includes('post')) {
            navigate(`/baidang/${notification.relatedId}`);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                {unreadCount} mới
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filter === 'unread' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Chưa đọc ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filter === 'read' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Đã đọc
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition hover:shadow-md ${
                                    !notification.isRead ? 'border-l-4 border-blue-500' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title || 'Thông báo'}
                                            </h3>
                                            {!notification.isRead && (
                                                <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">{notification.message || 'Bạn có thông báo mới.'}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : ''}
                                        </p>
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

export default Notifications;

