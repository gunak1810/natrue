'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getBanners } from '@/lib/firestore';
import 'swiper/css';
import 'swiper/css/pagination';
import './HeroSlider.css';

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const data = await getBanners();
        setBanners(data);
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);


  if (loading) {
    return <section className="glass-carousel-section" style={{ minHeight: isMobile ? '180px' : '400px' }}></section>;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="glass-carousel-section">
      <div className="container">
        <Swiper
          modules={[Pagination, Autoplay]}
          direction="vertical"
          spaceBetween={isMobile ? 12 : 0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="glass-swiper"
        >
          {banners.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="glass-slide">
                <div className="glass-slide-bg">
                  <img src={slide.image} alt={slide.title} />
                  <div className="glass-slide-overlay" />
                </div>
                
                {(slide.showOverlay !== false) && (
                  <div className="glass-slide-content">
                    <div className="glass-slide-card">
                      <span className="glass-slide-subtitle" style={{ color: isMobile ? '#fff' : slide.color }}>
                        {slide.subtitle}
                      </span>
                      <h2 className="glass-slide-title">{slide.title}</h2>
                      <p className="glass-slide-desc">{slide.desc}</p>
                      <Link href={slide.link || '#'} className="glass-btn-primary">
                        Shop Now <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

