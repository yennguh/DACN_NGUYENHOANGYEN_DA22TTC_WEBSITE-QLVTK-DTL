import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';
import { LoadingSpinner } from '../../core/LoadingSpinner';

const STATUS_LABEL = {
  approved: { text: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
  pending: { text: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
  rejected: { text: 'Đã từ chối', className: 'bg-red-100 text-red-700' },
  completed: { text: 'Đã hoàn thành', className: 'bg-blue-100 text-blue-700' }
};

export default function MyPosts() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = { userId: user._id, limit: 100 };
        if (filterStatus !== 'all') params.status = filterStatus;
        const result = await fetchPosts(params);
        if (result && result.data) setPosts(result.data);
        else setPosts([]);
      } catch (err) {
        console.error('Error loading my posts', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, filterStatus]);

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Bài đăng của tôi</h1>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded ${filterStatus==='all' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Tất cả</button>
          <button onClick={() => setFilterStatus('approved')} className={`px-3 py-1 rounded ${filterStatus==='approved' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Đã duyệt</button>
          <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1 rounded ${filterStatus==='pending' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Chờ duyệt</button>
          <button onClick={() => setFilterStatus('rejected')} className={`px-3 py-1 rounded ${filterStatus==='rejected' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Từ chối</button>
          <button onClick={() => setFilterStatus('completed')} className={`px-3 py-1 rounded ${filterStatus==='completed' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Hoàn thành</button>
        </div>

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-500">Đang tải bài đăng...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-gray-600">Không có bài đăng nào.</div>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li key={p._id} className="border rounded p-3 flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg cursor-pointer text-blue-600" onClick={() => navigate(`/baidang/${p._id}`)}>{p.title}</div>
                    <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString('vi-VN')}</div>
                    <div className="mt-2 text-gray-700">{p.description?.slice(0, 180)}{p.description && p.description.length > 180 ? '...' : ''}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABEL[p.status]?.className || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABEL[p.status]?.text || p.status}</span>
                    <div>
                      <button onClick={() => navigate(`/baidang/${p._id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Xem</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
