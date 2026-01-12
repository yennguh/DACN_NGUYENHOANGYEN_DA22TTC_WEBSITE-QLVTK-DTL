import { useState, useEffect, useRef } from 'react';
import { Search, Send, Clock, User, MessageSquare, Image, X, Ban, UserX, CheckCircle, Trash2 } from 'lucide-react';
import { fetchContacts, addReply, updateContact, deleteContact, deleteReply } from '../../api/contact.api';
import { blockUserFromContact, unblockUserFromContact } from '../../api/users.api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8017';

export default function ContactMessages() {
    const [contacts, setContacts] = useState([]);
    const [blockedContacts, setBlockedContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('messages');
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'contact' | 'reply', contact, replyIndex }
    const messagesEndRef = useRef(null);
    const imageInputRef = useRef(null);

    useEffect(() => {
        refreshAllData();
    }, []);

    useEffect(() => {
        if (activeTab === 'messages') fetchData();
        else fetchBlockedData();
    }, [statusFilter, activeTab]);

    useEffect(() => { scrollToBottom(); }, [selectedContact]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await fetchContacts({ page: 1, limit: 100, includeBlocked: false, ...(statusFilter && { status: statusFilter }) });
            if (result?.data) setContacts(result.data);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchBlockedData = async () => {
        setLoading(true);
        try {
            const result = await fetchContacts({ page: 1, limit: 100, includeBlocked: true });
            if (result?.data) setBlockedContacts(result.data);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const refreshAllData = async () => {
        try {
            const [normalResult, blockedResult] = await Promise.all([
                fetchContacts({ page: 1, limit: 100, includeBlocked: false }),
                fetchContacts({ page: 1, limit: 100, includeBlocked: true })
            ]);
            if (normalResult?.data) setContacts(normalResult.data);
            if (blockedResult?.data) setBlockedContacts(blockedResult.data);
        } catch (error) { console.error('Error:', error); }
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
        setSending(true);
        try {
            await addReply(selectedContact._id, replyMessage.trim(), selectedImage);
            setReplyMessage('');
            removeSelectedImage();
            await refreshAllData();
            const updated = (activeTab === 'messages' ? contacts : blockedContacts).find(c => c._id === selectedContact._id);
            if (updated) setSelectedContact(updated);
            else {
                const result = await fetchContacts({ page: 1, limit: 100, includeBlocked: activeTab === 'blocked' });
                const upd = result?.data?.find(c => c._id === selectedContact._id);
                if (upd) setSelectedContact(upd);
            }
            scrollToBottom();
        } catch (error) { alert(error.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setSending(false); }
    };

    const handleSelectContact = async (contact) => {
        setSelectedContact(contact);
        if (contact.status === 'new') {
            try {
                await updateContact(contact._id, { status: 'read' });
                if (activeTab === 'messages') fetchData();
                else fetchBlockedData();
            } catch (error) { console.error('Error:', error); }
        }
    };

    // Mở modal xóa
    const openDeleteModal = (type, contact, replyIndex = null) => {
        setDeleteTarget({ type, contact, replyIndex });
        setShowDeleteModal(true);
    };

    // Xóa cả cuộc hội thoại
    const handleDeleteContact = async () => {
        if (!deleteTarget?.contact) return;
        try {
            await deleteContact(deleteTarget.contact._id);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            if (selectedContact?._id === deleteTarget.contact._id) setSelectedContact(null);
            await refreshAllData();
        } catch (error) { alert('Có lỗi xảy ra'); }
    };

    // Xóa một tin nhắn cụ thể
    const handleDeleteReply = async () => {
        if (!deleteTarget?.contact || deleteTarget.replyIndex === null) return;
        try {
            await deleteReply(deleteTarget.contact._id, deleteTarget.replyIndex);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            await refreshAllData();
            // Cập nhật selectedContact
            const result = await fetchContacts({ page: 1, limit: 100, includeBlocked: activeTab === 'blocked' });
            const updated = result?.data?.find(c => c._id === selectedContact._id);
            if (updated) setSelectedContact(updated);
        } catch (error) { alert(error.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    // Chặn user
    const openBlockModal = (contact) => {
        if (!contact.userId) { alert('Không thể chặn người dùng này'); return; }
        setUserToBlock(contact);
        setShowBlockModal(true);
    };

    const handleBlockUser = async () => {
        if (!userToBlock?.userId) return;
        try {
            await blockUserFromContact(userToBlock.userId);
            setShowBlockModal(false);
            setUserToBlock(null);
            setSelectedContact(null);
            await refreshAllData();
            alert('Đã chặn tài khoản');
        } catch (error) { alert(error.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handleUnblockUser = async (contact) => {
        if (!contact.userId) return;
        try {
            await unblockUserFromContact(contact.userId);
            setSelectedContact(null);
            await refreshAllData();
            alert('Đã bỏ chặn tài khoản');
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('data:') || imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const currentContacts = activeTab === 'messages' ? contacts : blockedContacts;
    const filteredContacts = currentContacts.filter(contact => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return contact.subject?.toLowerCase().includes(search) || contact.name?.toLowerCase().includes(search) || contact.email?.toLowerCase().includes(search);
    });

    return (
        <div className="h-screen flex flex-col bg-gray-100" style={{ height: 'calc(100vh - 80px)' }}>
            {/* Tabs */}
            <div className="bg-white border-b px-4">
                <div className="flex gap-4">
                    <button onClick={() => { setActiveTab('messages'); setSelectedContact(null); }}
                        className={`py-3 px-4 font-medium border-b-2 transition-colors ${activeTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <MessageSquare className="w-4 h-4 inline mr-2" />Tin nhắn ({contacts.length})
                    </button>
                    <button onClick={() => { setActiveTab('blocked'); setSelectedContact(null); }}
                        className={`py-3 px-4 font-medium border-b-2 transition-colors ${activeTab === 'blocked' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <UserX className="w-4 h-4 inline mr-2" />Tài khoản bị chặn ({blockedContacts.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r flex flex-col">
                    <div className={`p-4 border-b ${activeTab === 'blocked' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                        <h2 className="font-semibold text-lg mb-3">{activeTab === 'blocked' ? '🚫 Tin nhắn bị chặn' : '💬 Tin nhắn liên hệ'}</h2>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none text-sm text-gray-800" />
                        </div>
                        {activeTab === 'messages' && (
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg outline-none text-sm text-gray-800">
                                <option value="">Tất cả</option>
                                <option value="new">Mới</option>
                                <option value="read">Đã đọc</option>
                                <option value="replied">Đã phản hồi</option>
                            </select>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>{activeTab === 'blocked' ? 'Không có tin nhắn bị chặn' : 'Không có tin nhắn nào'}</p>
                            </div>
                        ) : (
                            filteredContacts.map((contact) => {
                                const lastReply = contact.replies?.length > 0 ? contact.replies[contact.replies.length - 1] : null;
                                const lastMessage = lastReply ? lastReply.message : contact.message;
                                const lastTime = lastReply ? lastReply.createdAt : contact.createdAt;
                                const isUnread = contact.status === 'new';
                                return (
                                    <div key={contact._id} onClick={() => handleSelectContact(contact)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact?._id === contact._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''} ${isUnread ? 'bg-yellow-50' : ''}`}>
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="font-semibold text-gray-800 truncate flex-1">{contact.subject}</div>
                                            {isUnread && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>}
                                            {activeTab === 'blocked' && <Ban className="w-4 h-4 text-red-500 ml-2" />}
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden ${activeTab === 'blocked' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                {contact.userAvatar ? <img src={getImageUrl(contact.userAvatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{contact.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-600 truncate mb-1"><span className="font-medium">{contact.name}</span></div>
                                                <div className="text-sm text-gray-600 truncate mb-2">{lastMessage?.substring(0, 50)}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(lastTime)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedContact ? (
                        <>
                            {/* Header */}
                            <div className={`p-4 border-b ${activeTab === 'blocked' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ${activeTab === 'blocked' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                        {selectedContact.userAvatar ? <img src={getImageUrl(selectedContact.userAvatar)} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{selectedContact.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedContact.email}</p>
                                        {activeTab === 'blocked' && <span className="text-xs text-red-600 font-medium flex items-center gap-1"><Ban className="w-3 h-3" /> Tài khoản đã bị chặn</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'messages' ? (
                                            <button onClick={() => openBlockModal(selectedContact)} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm flex items-center gap-1">
                                                <Ban className="w-4 h-4" /> Chặn
                                            </button>
                                        ) : (
                                            <button onClick={() => handleUnblockUser(selectedContact)} className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" /> Bỏ chặn
                                            </button>
                                        )}
                                        <button onClick={() => openDeleteModal('contact', selectedContact)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Xóa cuộc hội thoại">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                                {/* First message from user */}
                                <div className="flex justify-start items-end gap-2 group">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden ${activeTab === 'blocked' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                        {selectedContact.userAvatar ? <img src={getImageUrl(selectedContact.userAvatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{selectedContact.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                                    </div>
                                    <div className="max-w-[70%]">
                                        <div className="text-xs text-gray-500 mb-1 ml-1">{selectedContact.name}</div>
                                        <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                                            <p className="text-sm text-gray-800">{selectedContact.message}</p>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{formatFullDate(selectedContact.createdAt)}</div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedContact.replies?.map((reply, index) => (
                                    <div key={index} className={`flex items-end gap-2 group ${reply.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        {reply.sender !== 'admin' && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden ${activeTab === 'blocked' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                {selectedContact.userAvatar ? <img src={getImageUrl(selectedContact.userAvatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{selectedContact.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                                            </div>
                                        )}
                                        <div className="max-w-[70%] relative">
                                            <div className={`text-xs text-gray-500 mb-1 ${reply.sender === 'admin' ? 'text-right mr-1' : 'ml-1'}`}>
                                                {reply.sender === 'admin' ? (reply.senderName || 'Admin') : selectedContact.name}
                                            </div>
                                            <div className={`rounded-2xl px-4 py-2 shadow-sm ${reply.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-800'}`}>
                                                {reply.message && <p className="text-sm">{reply.message}</p>}
                                                {reply.image && <img src={getImageUrl(reply.image)} alt="" className="mt-2 max-w-full rounded-lg cursor-pointer" style={{ maxHeight: '200px' }} onClick={() => window.open(getImageUrl(reply.image), '_blank')} />}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs text-gray-500 ${reply.sender === 'admin' ? 'text-right flex-1' : ''}`}>{formatFullDate(reply.createdAt)}</span>
                                                <button onClick={() => openDeleteModal('reply', selectedContact, index)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Xóa tin nhắn này">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        {reply.sender === 'admin' && (
                                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                                                {reply.senderAvatar ? <img src={getImageUrl(reply.senderAvatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{(reply.senderName || 'A').charAt(0).toUpperCase()}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t bg-white">
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
                                    <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                        <Image className="w-6 h-6" />
                                    </button>
                                    <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Nhập tin nhắn phản hồi..."
                                        className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none" disabled={sending} />
                                    <button type="submit" disabled={sending || (!replyMessage.trim() && !selectedImage)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Chọn một tin nhắn để xem</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xóa */}
            {showDeleteModal && deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{deleteTarget.type === 'contact' ? 'Xóa cuộc hội thoại' : 'Xóa tin nhắn'}</h3>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {deleteTarget.type === 'contact' 
                                ? <>Bạn có chắc muốn xóa cuộc hội thoại "<span className="font-semibold">{deleteTarget.contact.subject}</span>"?<br/><span className="text-red-500 text-sm">Tin nhắn sẽ bị xóa hoàn toàn (cả 2 bên)</span></>
                                : 'Bạn có chắc muốn xóa tin nhắn này?'}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Hủy</button>
                            <button onClick={deleteTarget.type === 'contact' ? handleDeleteContact : handleDeleteReply}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chặn */}
            {showBlockModal && userToBlock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Chặn tài khoản</h3>
                            <button onClick={() => { setShowBlockModal(false); setUserToBlock(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl mb-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                                {userToBlock.userAvatar ? <img src={getImageUrl(userToBlock.userAvatar)} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-orange-500" />}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">{userToBlock.name}</div>
                                <div className="text-sm text-gray-600">{userToBlock.email}</div>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">Khi chặn tài khoản này:<br/>• Tin nhắn sẽ chuyển sang tab "Tài khoản bị chặn"<br/>• Người dùng không thể gửi tin nhắn mới</p>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowBlockModal(false); setUserToBlock(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Hủy</button>
                            <button onClick={handleBlockUser} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center justify-center gap-2">
                                <Ban className="w-4 h-4" /> Chặn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
