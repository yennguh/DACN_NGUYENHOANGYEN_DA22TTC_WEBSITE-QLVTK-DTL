import { useState, useContext, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Clock, User, Search, Mail, Phone, Sparkles, CheckCircle2, Circle, ArrowLeft, RefreshCw, Image, X, Trash2 } from 'lucide-react';
import { sendContact, getMyContacts, addReply, recallContact, deleteReply } from '../../api/contact.api';
import { AuthContext } from '../../core/AuthContext';
import { inforUser, checkUserBlocked } from '../../api/users.api';
import { getImageUrl } from '../../utils/constant';

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        if (token) {
            fetchUserInfo();
            fetchData();
            checkBlockedStatus();
        }
    }, [token]);

    useEffect(() => { scrollToBottom(); }, [selectedContact]);

    const checkBlockedStatus = async () => {
        try {
            const result = await checkUserBlocked();
            setIsBlocked(result?.blocked === true);
        } catch (error) { console.error('Error:', error); }
    };

    const fetchUserInfo = async () => {
        try {
            const userData = await inforUser();
            setUserInfo(userData || user);
        } catch (error) { setUserInfo(user); }
    };

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await getMyContacts();
            const data = result?.data || (Array.isArray(result) ? result : []);
            setMyContacts(data);
            if (!selectedContact && data.length > 0) setSelectedContact(data[0]);
        } catch (error) { setMyContacts([]); }
        finally { setLoading(false); }
    };

    const handleSendNewMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.subject.trim() || !newMessage.message.trim()) return;
        if (isBlocked) { alert('Tài khoản của bạn đã bị chặn khỏi tính năng liên hệ.'); return; }

        setSending(true);
        try {
            const payload = {
                name: userInfo?.fullname || user?.fullname || 'User',
                email: userInfo?.email || user?.email || '',
                phone: userInfo?.phone || user?.phone || '',
                subject: newMessage.subject.trim(),
                message: newMessage.message.trim()
            };
            await sendContact(payload);
            setNewMessage({ subject: '', message: '' });
            setShowNewMessageForm(false);
            await fetchData();
        } catch (error) {
            if (error.response?.data?.blocked) setIsBlocked(true);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setSending(false); }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert('Ảnh không được vượt quá 5MB'); return; }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if ((!replyMessage.trim() && !selectedImage) || !selectedContact) return;
        if (isBlocked) { alert('Tài khoản của bạn đã bị chặn khỏi tính năng liên hệ.'); return; }

        setSending(true);
        const replyText = replyMessage.trim();
        const imageFile = selectedImage;
        setReplyMessage('');
        removeSelectedImage();

        // Optimistic update
        const tempReply = { message: replyText, image: imagePreview, sender: 'user', senderName: userInfo?.fullname || 'User', createdAt: new Date().toISOString() };
        const updatedContact = { ...selectedContact, replies: [...(selectedContact.replies || []), tempReply] };
        setSelectedContact(updatedContact);
        setMyContacts(prev => prev.map(c => c._id === selectedContact._id ? updatedContact : c));

        try {
            await addReply(selectedContact._id, replyText, imageFile);
            await fetchData();
            const updated = myContacts.find(c => c._id === selectedContact._id);
            if (updated) setSelectedContact(updated);
        } catch (error) {
            setSelectedContact(selectedContact);
            setMyContacts(prev => prev.map(c => c._id === selectedContact._id ? selectedContact : c));
            setReplyMessage(replyText);
            if (error.response?.data?.blocked) setIsBlocked(true);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setSending(false); }
    };

    // Mở modal xóa
    const openDeleteModal = (type, contact, replyIndex = null) => {
        setDeleteTarget({ type, contact, replyIndex });
        setShowDeleteModal(true);
    };

    // Xóa cả cuộc hội thoại (thu hồi)
    const handleRecallContact = async () => {
        if (!deleteTarget?.contact) return;
        try {
            await recallContact(deleteTarget.contact._id);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            if (selectedContact?._id === deleteTarget.contact._id) setSelectedContact(null);
            await fetchData();
        } catch (error) { alert('Có lỗi xảy ra'); }
    };

    // Xóa một tin nhắn cụ thể
    const handleDeleteReply = async () => {
        if (!deleteTarget?.contact || deleteTarget.replyIndex === null) return;
        try {
            await deleteReply(deleteTarget.contact._id, deleteTarget.replyIndex);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            await fetchData();
            const updated = myContacts.find(c => c._id === selectedContact._id);
            if (updated) setSelectedContact(updated);
        } catch (error) { alert(error.response?.data?.message || 'Có lỗi xảy ra'); }
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
        return new Date(date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredContacts = myContacts.filter(contact => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return contact.subject?.toLowerCase().includes(search) || contact.message?.toLowerCase().includes(search);
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'replied': return { text: 'Đã phản hồi', className: 'bg-green-100 text-green-600', icon: CheckCircle2 };
            case 'read': return { text: 'Đã xem', className: 'bg-blue-100 text-blue-600', icon: CheckCircle2 };
            default: return { text: 'Mới', className: 'bg-yellow-100 text-yellow-600', icon: Circle };
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Liên hệ với chúng tôi</h1>
                        <p className="text-gray-600">Vui lòng đăng nhập để sử dụng tính năng chat</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                <Mail className="w-6 h-6 text-blue-600" />
                                <div><p className="font-medium text-gray-900">Email</p><p className="text-gray-600">hoangyen24042004@gmail.com</p></div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                                <Phone className="w-6 h-6 text-purple-600" />
                                <div><p className="font-medium text-gray-900">Hotline</p><p className="text-gray-600">0986 095 484</p></div>
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
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">💬 Trung tâm hỗ trợ</h1>
                    <p className="text-gray-600 mt-2">Gửi tin nhắn và nhận phản hồi từ Admin</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[calc(100vh-200px)]">
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className={`w-full md:w-96 bg-white border-r flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5" /><h2 className="font-semibold text-lg">Tin nhắn</h2></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={fetchData} className="p-2 hover:bg-white/20 rounded-xl" title="Làm mới"><RefreshCw className="w-5 h-5" /></button>
                                        <button onClick={() => setShowNewMessageForm(!showNewMessageForm)} className="p-2 hover:bg-white/20 rounded-xl" title="Tin nhắn mới"><Plus className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Tìm kiếm tin nhắn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-white/50 outline-none text-sm text-gray-800" />
                                </div>
                            </div>

                            {/* New Message Form */}
                            {showNewMessageForm && (
                                <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-purple-50">
                                    {isBlocked ? (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                                            <div className="text-red-600 font-medium mb-1">⚠️ Tài khoản bị chặn</div>
                                            <p className="text-sm text-red-500">Bạn không thể gửi tin nhắn.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendNewMessage} className="space-y-3">
                                            <input type="text" placeholder="Chủ đề tin nhắn..." value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                                            <textarea placeholder="Nội dung tin nhắn..." value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                                                rows="3" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" required />
                                            <div className="flex gap-2">
                                                <button type="submit" disabled={sending} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                                                    {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                                </button>
                                                <button type="button" onClick={() => { setShowNewMessageForm(false); setNewMessage({ subject: '', message: '' }); }}
                                                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">Hủy</button>
                                            </div>
                                        </form>
                                    )}
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
                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-10 h-10 text-gray-300" /></div>
                                        <p className="text-gray-600 font-medium">Chưa có tin nhắn nào</p>
                                        <p className="text-gray-400 text-sm mt-1">Nhấn + để gửi tin nhắn mới</p>
                                    </div>
                                ) : (
                                    filteredContacts.map((contact) => {
                                        const lastReply = contact.replies?.length > 0 ? contact.replies[contact.replies.length - 1] : null;
                                        const lastMessage = lastReply ? lastReply.message : contact.message;
                                        const lastTime = lastReply ? lastReply.createdAt : contact.createdAt;
                                        const statusBadge = getStatusBadge(contact.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <div key={contact._id} onClick={() => { setSelectedContact(contact); setShowMobileChat(true); }}
                                                className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedContact?._id === contact._id ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600' : ''}`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-800 truncate flex-1 pr-2">{contact.subject}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.className}`}>
                                                        <StatusIcon className="w-3 h-3" />{statusBadge.text}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate mb-2">{lastMessage?.substring(0, 60)}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{formatTime(lastTime)}</div>
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
                                            <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg"><User className="w-6 h-6" /></div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800">{selectedContact.subject}</h3>
                                                <p className="text-sm text-gray-500">Admin sẽ phản hồi sớm nhất có thể</p>
                                            </div>
                                            <button onClick={() => openDeleteModal('contact', selectedContact)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title="Thu hồi cuộc hội thoại">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {/* First message (user's) */}
                                        <div className="flex justify-end group">
                                            <div className="max-w-[70%]">
                                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
                                                    <p className="text-sm leading-relaxed">{selectedContact.message}</p>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1.5 text-right flex items-center justify-end gap-1">
                                                    <Clock className="w-3 h-3" />{formatFullDate(selectedContact.createdAt)}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
                                                    {userInfo?.avatar ? <img src={getImageUrl(userInfo.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{(userInfo?.fullname || 'U').charAt(0).toUpperCase()}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {selectedContact.replies?.map((reply, index) => (
                                            <div key={index} className={`flex group ${reply.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                                                {reply.sender === 'admin' && (
                                                    <div className="flex-shrink-0 mr-2">
                                                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white overflow-hidden">
                                                            {reply.senderAvatar ? <img src={getImageUrl(reply.senderAvatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{(reply.senderName || 'A').charAt(0).toUpperCase()}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="max-w-[70%]">
                                                    <div className={`text-xs mb-1 ${reply.sender === 'admin' ? 'text-gray-500 ml-1' : 'text-gray-500 text-right mr-1'}`}>
                                                        {reply.sender === 'admin' ? (reply.senderName || 'Admin') : 'Bạn'}
                                                    </div>
                                                    <div className={`rounded-2xl px-4 py-3 shadow-lg ${reply.sender === 'admin' ? 'bg-white border rounded-tl-sm text-gray-800' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'}`}>
                                                        {reply.message && <p className="text-sm leading-relaxed">{reply.message}</p>}
                                                        {reply.image && <img src={getImageUrl(reply.image)} alt="" className="mt-2 max-w-full rounded-lg cursor-pointer" style={{ maxHeight: '200px' }} onClick={() => window.open(getImageUrl(reply.image), '_blank')} />}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs text-gray-400 flex items-center gap-1 ${reply.sender !== 'admin' ? 'flex-1 justify-end' : ''}`}>
                                                            <Clock className="w-3 h-3" />{formatFullDate(reply.createdAt)}
                                                        </span>
                                                        {reply.sender === 'user' && (
                                                            <button onClick={() => openDeleteModal('reply', selectedContact, index)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Xóa tin nhắn này">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {reply.sender !== 'admin' && (
                                                    <div className="flex-shrink-0 ml-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
                                                            {userInfo?.avatar ? <img src={getImageUrl(userInfo.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{(userInfo?.fullname || 'U').charAt(0).toUpperCase()}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white border-t">
                                        {isBlocked ? (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                                                <div className="text-red-600 font-medium">⚠️ Tài khoản bị chặn</div>
                                                <p className="text-sm text-red-500">Bạn không thể gửi tin nhắn.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {imagePreview && (
                                                    <div className="mb-3 relative inline-block">
                                                        <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border" />
                                                        <button onClick={removeSelectedImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <form onSubmit={handleSendReply} className="flex gap-2">
                                                    <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                                                    <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                        <Image className="w-5 h-5" />
                                                    </button>
                                                    <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Nhập tin nhắn..."
                                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" disabled={sending} />
                                                    <button type="submit" disabled={sending || (!replyMessage.trim() && !selectedImage)}
                                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="w-12 h-12 text-blue-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium text-lg">Chọn một tin nhắn để xem</p>
                                        <p className="text-gray-400 text-sm mt-1">Hoặc tạo tin nhắn mới</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal xóa */}
            {showDeleteModal && deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{deleteTarget.type === 'contact' ? 'Thu hồi cuộc hội thoại' : 'Xóa tin nhắn'}</h3>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {deleteTarget.type === 'contact' 
                                ? <>Bạn có chắc muốn thu hồi cuộc hội thoại "<span className="font-semibold">{deleteTarget.contact.subject}</span>"?<br/><span className="text-red-500 text-sm">Tin nhắn sẽ bị xóa hoàn toàn (cả 2 bên)</span></>
                                : 'Bạn có chắc muốn xóa tin nhắn này?'}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Hủy</button>
                            <button onClick={deleteTarget.type === 'contact' ? handleRecallContact : handleDeleteReply}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> {deleteTarget.type === 'contact' ? 'Thu hồi' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
