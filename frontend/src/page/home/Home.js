import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import ImageSlider from './Slider-home';
import { fetchPosts } from '../../api/posts.api';
import PostCard from '../../components/PostCard';
import { PostListSkeleton } from '../../core/LoadingSpinner';
import slider1 from '../../public/assets/slider-1.jpg';
import slider2 from '../../public/assets/slider-2.jpg';
import slider3 from '../../public/assets/slider-3.jpg';

export default function Home() {
  const navigate = useNavigate();
  const fallbackImages = [slider1, slider2, slider3];
  const [sliderImages, setSliderImages] = useState(fallbackImages);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Lấy TẤT CẢ bài đăng đã được admin duyệt
      // Bao gồm: bài của user thường, bài của Google account, bài chia sẻ, bài của admin
      const params = {
        status: 'approved',
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: -1, // Mới nhất trước
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      
      console.log('Fetching posts with params:', params);
      const response = await fetchPosts(params);
      console.log('API Response:', response);

      if (response?.data && Array.isArray(response.data)) {
        console.log('Total posts loaded:', response.data.length);
        setPosts(response.data);
        
        // Lấy ảnh cho slider
        const images = response.data
          .flatMap((post) => Array.isArray(post.images) ? post.images : [])
          .filter((src) => typeof src === 'string' && src.trim() !== '');

        if (images.length > 0) {
          setSliderImages(images.slice(0, 10));
        } else {
          setSliderImages(fallbackImages);
        }
      } else if (Array.isArray(response)) {
        // Trường hợp API trả về array trực tiếp
        console.log('Total posts loaded (array):', response.length);
        setPosts(response);
      } else {
        console.log('No posts found or invalid response');
        setPosts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải bài đăng:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <main className="site-content">
      <div className="content-inner">
        <ImageSlider images={sliderImages} autoPlayInterval={7000} />
        
        {/* Danh sách bài đăng */}
        <section className="mt-8 px-4 max-w-4xl mx-auto">
          {/* Header với search và filter */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đồ vật..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl">
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!categoryFilter ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setCategoryFilter('found')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${categoryFilter === 'found' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  ✨ Nhặt được
                </button>
                <button
                  onClick={() => setCategoryFilter('lost')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${categoryFilter === 'lost' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  🔍 Thất lạc
                </button>
              </div>

              {/* Nút đăng tin */}
              <button
                onClick={() => navigate('/baidang/create')}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Đăng tin
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {categoryFilter === 'found' ? '✨ Đồ nhặt được' : categoryFilter === 'lost' ? '🔍 Đồ thất lạc' : '📋 Bài đăng mới nhất'}
          </h2>
          
          {loading ? (
            <PostListSkeleton count={6} />
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} item={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">Chưa có bài đăng nào.</p>
              <button
                onClick={() => navigate('/baidang/create')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Đăng tin mới
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
