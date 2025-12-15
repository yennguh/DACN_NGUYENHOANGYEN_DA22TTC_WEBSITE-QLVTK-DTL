import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
    MessageSquare, 
    Send, 
    Plus, 
    Clock, 
    User, 
    Search,
    Mail,
    Phone,
    Sparkles,
    CheckCircle2,
    Circle,
    ArrowLeft,
    RefreshCw,
    Image,
    X
} from 'lucide-react';
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
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (token) {
            fetchUserInfo();
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const params = { page: 1, limit: 100 };
            const result = await fetchContacts(params);
            
            if (result && result.data) {
                const userEmail = userInfo?.email || user?.email;
                const filtered = result.data.filter(contact => contact.email === userEmail);
                setMyContacts(filtered);
                if (!selectedContact && filtered.length > 0) {
                    setSelectedContact(filtered[0]);
                }
            } else if (result && Array.isArray(result)) {
                const userEmail = userInfo?.email || user?.email;
                const filtered = result.filter(contact => contact.email === userEmail);
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
            const result = await sendContact(payload);
            
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
            
            setMyContacts(prev => [newContact, ...prev]);
            setSelectedContact(newContact);
            setNewMessage({ subject: '', message: '' });
            setShowNewMessageForm(false);
            
            setTimeout(() => fetchData(), 500);
        } catch (error) {
            console.error('Error sending contact:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Ảnh không được vượt quá 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if ((!replyMessage.trim() && !selectedImage) || !selectedContact) return;

        setSending(true);
        const replyText = replyMessage.trim();
        const imageFile = selectedImage;
        setReplyMessage('');
        removeSelectedImage();
        
        const tempReply = {
            message: replyText,
            image: imagePreview,
            sender: 'user',
            senderId: null,
            senderName: userInfo?.fullname || user?.fullname || 'User',
            createdAt: new Date().toISOString()
        };
        
        const updatedContact = {
            ...selectedContact,
            replies: [...(selectedContact.replies || []), tempReply]
        };
        setSelectedContact(updatedContact);
        setMyContacts(prev => prev.map(contact => 
            contact._id === selectedContact._id ? updatedContact : contact
        ));
        
        try {
            await addReply(selectedContact._id, replyText, imageFile);
            setTimeout(() => {
                fetchData();
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

    const filteredContacts = myContacts.filter(contact => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            contact.subject?.toLowerCase().includes(search) ||
            contact.message?.toLowerCase().includes(search)
        );
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'replied':
                return { text: 'Đã phản hồi', className: 'bg-green-100 text-green-600', icon: CheckCircle2 };
            case 'read':
                return { text: 'Đã xem', className: 'bg-blue-100 text-blue-600', icon: CheckCircle2 };
            default:
                return { text: 'Mới', className: 'bg-yellow-100 text-yellow-600', icon: Circle };
        }
    };

    // Not logged in view
    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            Liên hệ với chúng tôi
                        </h1>
                        <p className="text-gray-600">Vui lòng đăng nhập để sử dụng tính năng chat</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                <Mail className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Email</p>
                                    <p className="text-gray-600">hoangyen24042004@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                                <Phone className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Hotline</p>
                                    <p className="text-gray-600">0986 095 484</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        💬 Trung tâm hỗ trợ
                    </h1>
                    <p className="text-gray-600 mt-2">Gửi tin nhắn và nhận phản hồi từ Admin</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[calc(100vh-200px)]">
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className={`w-full md:w-96 bg-white border-r flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            {/* Sidebar Header */}
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        <h2 className="font-semibold text-lg">Tin nhắn</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={fetchData}
                                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                            title="Làm mới"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setShowNewMessageForm(!showNewMessageForm)}
                                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                            title="Tin nhắn mới"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm tin nhắn..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-white/50 outline-none text-sm text-gray-800"
                                    />
                                </div>
                            </div>

                            {/* New Message Form */}
                            {showNewMessageForm && (
                                <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-purple-50">
                                    <form onSubmit={handleSendNewMessage} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Chủ đề tin nhắn..."
                                            value={newMessage.subject}
                                            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            required
                                        />
                                        <textarea
                                            placeholder="Nội dung tin nhắn..."
                                            value={newMessage.message}
                                            onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={sending}
                                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-all transform hover:scale-[1.02]"
                                            >
                                                {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewMessageForm(false);
                                                    setNewMessage({ subject: '', message: '' });
                                                }}
                                                className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition-colors"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Contact List */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-500 text-sm">Đang tải tin nhắn...</p>
                                    </div>
                                ) : filteredContacts.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Chưa có tin nhắn nào</p>
                                        <p className="text-gray-400 text-sm mt-1">Nhấn + để gửi tin nhắn mới</p>
                                    </div>
                                ) : (
                                    filteredContacts.map((contact) => {
                                        const lastReply = contact.replies?.length > 0 
                                            ? contact.replies[contact.replies.length - 1]
                                            : null;
                                        const lastMessage = lastReply ? lastReply.message : contact.message;
                                        const lastTime = lastReply ? lastReply.createdAt : contact.createdAt;
                                        const isUnread = contact.status === 'new' || 
                                            (contact.replies?.length > 0 && 
                                             contact.replies[contact.replies.length - 1].sender === 'admin' &&
                                             contact.status !== 'read');
                                        const statusBadge = getStatusBadge(contact.status);
                                        const StatusIcon = statusBadge.icon;

                                        return (
                                            <div
                                                key={contact._id}
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setShowMobileChat(true);
                                                }}
                                                className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                                                    selectedContact?._id === contact._id 
                                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600' 
                                                        : ''
                                                } ${isUnread ? 'bg-yellow-50/50' : ''}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-800 truncate flex-1 pr-2">
                                                        {contact.subject}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.className}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusBadge.text}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate mb-2">
                                                    {lastMessage.substring(0, 60)}{lastMessage.length > 60 ? '...' : ''}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(lastTime)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 flex flex-col bg-gray-50 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            {selectedContact ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 bg-white border-b shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowMobileChat(false)}
                                                className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                            >
                                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800">{selectedContact.subject}</h3>
                                                <p className="text-sm text-gray-500">Admin sẽ phản hồi sớm nhất có thể</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {/* First message */}
                                        <div className="flex justify-end">
                                            <div className="max-w-[75%]">
                                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
                                                    <p className="text-sm leading-relaxed">{selectedContact.message}</p>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1.5 text-right flex items-center justify-end gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatFullDate(selectedContact.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {selectedContact.replies?.map((reply, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${reply.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div className="max-w-[75%]">
                                                    {reply.sender === 'admin' && (
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                                                <User className="w-3 h-3 text-white" />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">Admin</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`rounded-2xl px-4 py-3 shadow-md ${
                                                            reply.sender === 'admin'
                                                                ? 'bg-white border border-gray-100 rounded-tl-sm text-gray-800'
                                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'
                                                        }`}
                                                    >
                                                        {reply.message && <p className="text-sm leading-relaxed">{reply.message}</p>}
                                                        {reply.image && (
                                                            <img 
                                                                src={reply.image.startsWith('data:') ? reply.image : `${process.env.REACT_APP_API_URL}${reply.image}`}
                                                                alt="Ảnh đính kèm"
                                                                className="mt-2 max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                style={{ maxHeight: '200px' }}
                                                                onClick={() => window.open(reply.image.startsWith('data:') ? reply.image : `${process.env.REACT_APP_API_URL}${reply.image}`, '_blank')}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className={`text-xs text-gray-400 mt-1.5 flex items-center gap-1 ${
                                                        reply.sender === 'admin' ? 'justify-start' : 'justify-end'
                                                    }`}>
                                                        <Clock className="w-3 h-3" />
                                                        {formatFullDate(reply.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 bg-white border-t">
                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mb-3 relative inline-block">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="max-h-24 rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeSelectedImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        <form onSubmit={handleSendReply} className="flex gap-3">
                                            <input
                                                type="file"
                                                ref={imageInputRef}
                                                onChange={handleImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => imageInputRef.current?.click()}
                                                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                                title="Gửi ảnh"
                                            >
                                                <Image className="w-5 h-5 text-gray-500" />
                                            </button>
                                            <input
                                                type="text"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Nhập tin nhắn của bạn..."
                                                className="flex-1 px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || (!replyMessage.trim() && !selectedImage)}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transform hover:scale-105"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare className="w-12 h-12 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn một cuộc trò chuyện</h3>
                                        <p className="text-gray-500">Hoặc nhấn + để gửi tin nhắn mới đến Admin</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
