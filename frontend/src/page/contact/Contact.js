import React, { useState, useContext, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Clock, User, Search } from 'lucide-react';
import { sendContact, fetchContacts, addReply } from '../../api/contact.api';
import { AuthContext } from '../../core/AuthContext';
import { inforUser } from '../../api/users.api';

const Contact = () => {
    const { token, user } = useContext(AuthContext);
    const [myContacts, setMyContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewMessageForm, setShowNewMessageForm] = useState(false);
    const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const [userInfo, setUserInfo] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (token) {
            fetchUserInfo();
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedContact]);

    const fetchUserInfo = async () => {
        try {
            const userData = await inforUser();
            if (userData) {
                setUserInfo(userData);
            } else if (user) {
                setUserInfo(user);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            if (user) {
                setUserInfo(user);
            }
        }
    };

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Lấy tất cả contacts giống admin
            const params = {
                page: 1,
                limit: 100
            };
            const result = await fetchContacts(params);
            console.log('fetchContacts result:', result);
            
            if (result && result.data) {
                // Filter theo email của user hiện tại
                const userEmail = userInfo?.email || user?.email;
                const filtered = result.data.filter(contact => 
                    contact.email === userEmail
                );
                console.log('Filtered contacts:', filtered);
                setMyContacts(filtered);
                
                // Auto select first contact if none selected
                if (!selectedContact && filtered.length > 0) {
                    setSelectedContact(filtered[0]);
                }
            } else if (result && Array.isArray(result)) {
                // Nếu API trả về trực tiếp array
                const userEmail = userInfo?.email || user?.email;
                const filtered = result.filter(contact => 
                    contact.email === userEmail
                );
                setMyContacts(filtered);
                if (!selectedContact && filtered.length > 0) {
                    setSelectedContact(filtered[0]);
                }
            } else {
                setMyContacts([]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setMyContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNewMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.subject.trim() || !newMessage.message.trim()) return;

        setSending(true);
        try {
            const payload = {
                name: userInfo?.fullname || user?.fullname || 'User',
                email: userInfo?.email || user?.email || '',
                phone: userInfo?.phone || user?.phone || '',
                subject: newMessage.subject.trim(),
                message: newMessage.message.trim()
            };
            console.log('Sending contact:', payload);
            const result = await sendContact(payload);
            console.log('Send contact result:', result);
            
            // Tạo contact mới ngay lập tức để hiển thị
            const newContact = {
                _id: result?.data?.insertedId || `temp-${Date.now()}`,
                subject: newMessage.subject.trim(),
                message: newMessage.message.trim(),
                email: userInfo?.email || user?.email || '',
                name: userInfo?.fullname || user?.fullname || 'User',
                phone: userInfo?.phone || user?.phone || '',
                status: 'new',
                replies: [],
                createdAt: new Date().toISOString()
            };
            
            // Thêm vào đầu danh sách và chọn ngay
            setMyContacts(prev => [newContact, ...prev]);
            setSelectedContact(newContact);
            setNewMessage({ subject: '', message: '' });
            setShowNewMessageForm(false);
            
            // Fetch lại để lấy dữ liệu chính xác từ server
            setTimeout(() => {
                fetchData();
            }, 500);
        } catch (error) {
            console.error('Error sending contact:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedContact) return;

        setSending(true);
        const replyText = replyMessage.trim();
        setReplyMessage('');
        
        // Tạo reply tạm thời để hiển thị ngay
        const tempReply = {
            message: replyText,
            sender: 'user',
            senderId: null,
            senderName: userInfo?.fullname || user?.fullname || 'User',
            createdAt: new Date().toISOString()
        };
        
        // Cập nhật selectedContact ngay lập tức
        const updatedContact = {
            ...selectedContact,
            replies: [...(selectedContact.replies || []), tempReply]
        };
        setSelectedContact(updatedContact);
        
        // Cập nhật trong danh sách
        setMyContacts(prev => prev.map(contact => 
            contact._id === selectedContact._id ? updatedContact : contact
        ));
        
        try {
            await addReply(selectedContact._id, replyText);
            
            // Fetch lại để lấy dữ liệu chính xác từ server
            setTimeout(() => {
                fetchData();
                // Update selected contact với dữ liệu từ server
                const userEmail = userInfo?.email || user?.email;
                fetchContacts({ page: 1, limit: 100 }).then(result => {
                    if (result && result.data) {
                        const filtered = result.data.filter(c => c.email === userEmail);
                        const updated = filtered.find(c => c._id === selectedContact._id);
                        if (updated) {
                            setMyContacts(filtered);
                            setSelectedContact(updated);
                        }
                    } else if (result && Array.isArray(result)) {
                        const filtered = result.filter(c => c.email === userEmail);
                        const updated = filtered.find(c => c._id === selectedContact._id);
                        if (updated) {
                            setMyContacts(filtered);
                            setSelectedContact(updated);
                        }
                    }
                });
            }, 500);
        } catch (error) {
            console.error('Error sending reply:', error);
            // Revert lại nếu lỗi
            setSelectedContact(selectedContact);
            setMyContacts(prev => prev.map(contact => 
                contact._id === selectedContact._id ? selectedContact : contact
            ));
            setReplyMessage(replyText);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const formatFullDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter contacts by search term
    const filteredContacts = myContacts.filter(contact => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            contact.subject?.toLowerCase().includes(search) ||
            contact.message?.toLowerCase().includes(search)
        );
    });

    // If not logged in, show simple form
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">Liên hệ với chúng tôi</h1>
                        <p className="text-gray-600">Vui lòng đăng nhập để sử dụng tính năng chat</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar - Danh sách cuộc trò chuyện */}
            <div className="w-80 bg-white border-r flex flex-col">
                {/* Header */}
                <div className="p-4 border-b bg-blue-600 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-lg">Tin nhắn</h2>
                        <button
                            onClick={() => setShowNewMessageForm(!showNewMessageForm)}
                            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                            title="Tin nhắn mới"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-white outline-none text-sm text-gray-800"
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        className="mt-2 text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded text-white w-full"
                    >
                        Làm mới
                    </button>
                </div>

                {/* Form tin nhắn mới */}
                {showNewMessageForm && (
                    <div className="p-4 border-b bg-gray-50">
                        <form onSubmit={handleSendNewMessage} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Chủ đề..."
                                value={newMessage.subject}
                                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                required
                            />
                            <textarea
                                placeholder="Nội dung tin nhắn..."
                                value={newMessage.message}
                                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    {sending ? 'Đang gửi...' : 'Gửi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewMessageForm(false);
                                        setNewMessage({ subject: '', message: '' });
                                    }}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Danh sách cuộc trò chuyện */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có tin nhắn nào</p>
                            <p className="text-xs mt-1">Nhấn + để gửi tin nhắn mới</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => {
                            const lastReply = contact.replies && contact.replies.length > 0 
                                ? contact.replies[contact.replies.length - 1]
                                : null;
                            const lastMessage = lastReply ? lastReply.message : contact.message;
                            const lastTime = lastReply ? lastReply.createdAt : contact.createdAt;
                            const isUnread = contact.status === 'new' || 
                                (contact.replies && contact.replies.length > 0 && 
                                 contact.replies[contact.replies.length - 1].sender === 'admin' &&
                                 contact.status !== 'read');

                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedContact?._id === contact._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                    } ${isUnread ? 'bg-yellow-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="font-semibold text-gray-800 truncate flex-1">
                                            {contact.subject}
                                        </div>
                                        {isUnread && (
                                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate mb-2">
                                        {lastMessage.substring(0, 50)}{lastMessage.length > 50 ? '...' : ''}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(lastTime)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{selectedContact.subject}</h3>
                                    <p className="text-sm text-gray-600">Admin sẽ phản hồi sớm nhất</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                            {/* Tin nhắn đầu tiên từ user */}
                            <div className="flex justify-end">
                                <div className="max-w-[70%]">
                                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 shadow-sm">
                                        <p className="text-sm">{selectedContact.message}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                        {formatFullDate(selectedContact.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Các phản hồi */}
                            {selectedContact.replies && selectedContact.replies.map((reply, index) => (
                                <div
                                    key={index}
                                    className={`flex ${reply.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[70%]`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                                                reply.sender === 'admin'
                                                    ? 'bg-white border rounded-tl-none text-gray-800'
                                                    : 'bg-blue-600 text-white rounded-tr-none'
                                            }`}
                                        >
                                            <p className="text-sm">{reply.message}</p>
                                        </div>
                                        <div
                                            className={`text-xs text-gray-500 mt-1 ${
                                                reply.sender === 'admin' ? 'text-left' : 'text-right'
                                            }`}
                                        >
                                            {formatFullDate(reply.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !replyMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                            <p className="text-sm mt-2">Hoặc nhấn + để gửi tin nhắn mới</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contact;
