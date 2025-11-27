import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Clock, User, MessageSquare } from 'lucide-react';
import { fetchContacts, addReply, updateContact } from '../../api/contact.api';

export default function ContactMessages() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedContact]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                ...(statusFilter && { status: statusFilter })
            };
            const result = await fetchContacts(params);
            if (result && result.data) {
                setContacts(result.data);
                // Auto select first unread if none selected
                if (!selectedContact && result.data.length > 0) {
                    const unread = result.data.find(c => c.status === 'new');
                    setSelectedContact(unread || result.data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedContact) return;

        setSending(true);
        try {
            await addReply(selectedContact._id, replyMessage.trim());
            setReplyMessage('');
            await fetchData();
            // Update selected contact
            const result = await fetchContacts({ page: 1, limit: 100 });
            if (result && result.data) {
                const updated = result.data.find(c => c._id === selectedContact._id);
                if (updated) {
                    setSelectedContact(updated);
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi');
        } finally {
            setSending(false);
        }
    };

    const handleSelectContact = async (contact) => {
        setSelectedContact(contact);
        if (contact.status === 'new') {
            try {
                await updateContact(contact._id, { status: 'read' });
                await fetchData();
            } catch (error) {
                console.error('Error marking as read:', error);
            }
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

    const filteredContacts = contacts.filter(contact => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                contact.subject?.toLowerCase().includes(search) ||
                contact.name?.toLowerCase().includes(search) ||
                contact.email?.toLowerCase().includes(search) ||
                contact.message?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    return (
        <div className="h-screen flex flex-col bg-gray-100" style={{ height: 'calc(100vh - 80px)' }}>
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Danh sách tin nhắn */}
                <div className="w-80 bg-white border-r flex flex-col">
                    {/* Header với filter */}
                    <div className="p-4 border-b bg-blue-600 text-white">
                        <h2 className="font-semibold text-lg mb-3">Tin nhắn liên hệ</h2>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-white outline-none text-sm text-gray-800"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-white outline-none text-sm text-gray-800"
                        >
                            <option value="">Tất cả</option>
                            <option value="new">Mới</option>
                            <option value="read">Đã đọc</option>
                            <option value="replied">Đã phản hồi</option>
                        </select>
                    </div>

                    {/* Danh sách */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Không có tin nhắn nào</p>
                            </div>
                        ) : (
                            filteredContacts.map((contact) => {
                                const lastReply = contact.replies && contact.replies.length > 0 
                                    ? contact.replies[contact.replies.length - 1]
                                    : null;
                                const lastMessage = lastReply ? lastReply.message : contact.message;
                                const lastTime = lastReply ? lastReply.createdAt : contact.createdAt;
                                const isUnread = contact.status === 'new';
                                const hasNewAdminReply = contact.replies && contact.replies.length > 0 && 
                                    contact.replies[contact.replies.length - 1].sender === 'user';

                                return (
                                    <div
                                        key={contact._id}
                                        onClick={() => handleSelectContact(contact)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selectedContact?._id === contact._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        } ${isUnread ? 'bg-yellow-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="font-semibold text-gray-800 truncate flex-1">
                                                {contact.subject}
                                            </div>
                                            {isUnread && (
                                                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 truncate mb-1">
                                            <span className="font-medium">{contact.name}</span>
                                            <span className="text-gray-400 mx-1">•</span>
                                            <span>{contact.email}</span>
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
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{selectedContact.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedContact.email}</p>
                                        {selectedContact.phone && (
                                            <p className="text-xs text-gray-500">{selectedContact.phone}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-800">{selectedContact.subject}</div>
                                        <div className="text-xs text-gray-500">
                                            {formatTime(selectedContact.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                                {/* Tin nhắn đầu tiên từ user */}
                                <div className="flex justify-start">
                                    <div className="max-w-[70%]">
                                        <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                                            <p className="text-sm text-gray-800">{selectedContact.message}</p>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 text-left">
                                            {formatFullDate(selectedContact.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Các phản hồi */}
                                {selectedContact.replies && selectedContact.replies.map((reply, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${reply.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%]`}>
                                            <div
                                                className={`rounded-2xl px-4 py-2 shadow-sm ${
                                                    reply.sender === 'admin'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white border rounded-tl-none text-gray-800'
                                                }`}
                                            >
                                                <p className="text-sm">{reply.message}</p>
                                            </div>
                                            <div
                                                className={`text-xs text-gray-500 mt-1 ${
                                                    reply.sender === 'admin' ? 'text-right' : 'text-left'
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
                                        placeholder="Nhập tin nhắn phản hồi..."
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
                                <p className="text-lg font-medium">Chọn một tin nhắn để xem</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
