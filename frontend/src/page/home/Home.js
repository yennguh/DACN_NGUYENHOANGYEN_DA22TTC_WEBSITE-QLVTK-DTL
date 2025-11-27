import React, { useEffect, useState } from 'react';
import ImageSlider from './Slider-home';
import { fetchPosts } from '../../api/posts.api';
import slider1 from '../../public/assets/slider-1.jpg';
import slider2 from '../../public/assets/slider-2.jpg';
import slider3 from '../../public/assets/slider-3.jpg';

export default function Home() {
  const fallbackImages = [slider1, slider2, slider3];
  const [sliderImages, setSliderImages] = useState(fallbackImages);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetchPosts({
          status: 'approved',
          category: 'lost',
          limit: 10,
        });

        if (response?.data) {
          const images = response.data
            .flatMap((post) => Array.isArray(post.images) ? post.images : [])
            .filter((src) => typeof src === 'string' && src.trim() !== '');

          if (images.length > 0) {
            setSliderImages(images);
          } else {
            setSliderImages(fallbackImages);
          }
        }
      } catch (error) {
        console.error('Không thể tải hình ảnh slider:', error);
      }
    };

    loadImages();
  }, []);

  return (
    <main className="site-content">
      <div className="content-inner">
        <ImageSlider images={sliderImages} autoPlayInterval={7000} />
      </div>
    </main>
  );
}
