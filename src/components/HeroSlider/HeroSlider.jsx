'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './HeroSlider.css';

const defaultSlides = [
  {
    id: 1,
    title: 'FREE Customization',
    subtitle: 'NAME PRINT',
    description: 'On all eligible products',
    bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.7) 0%, rgba(79, 70, 229, 0.8) 100%)',
    accent: '#ec4899',
    emoji: '🎁'
  },
  {
    id: 2,
    title: 'Return Gifts',
    subtitle: 'Starting ₹20',
    description: '1200+ options • Free Gift Wrapping',
    bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.7) 0%, rgba(219, 39, 119, 0.8) 100%)',
    accent: '#fbbf24',
    emoji: '🎉'
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Trendy Collection',
    description: 'Discover the latest gifts & stationery',
    bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(147, 51, 234, 0.8) 100%)',
    accent: '#ffffff',
    textDark: true, /* Using white text universally now though */
    emoji: '✨'
  },
  {
    id: 4,
    title: 'Corporate Gifts',
    subtitle: 'Personalized',
    description: 'Pen, Keychain & Diary combos with your logo',
    bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.7) 0%, rgba(13, 148, 136, 0.8) 100%)',
    accent: '#f8fafc',
    emoji: '🏢'
  }
];

export default function HeroSlider({ banners }) {
  const slides = banners?.length > 0 ? banners : defaultSlides;

  return (
    <div className="hero-slider">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide" style={{ background: slide.bg || `var(--glass-bg-hover)` }}>
              <div className="hero-slide-content">
                <div className="hero-text">
                  {slide.title && (
                    <div className="hero-badge" style={{ background: slide.accent || '#E91E63' }}>
                      {slide.title}
                    </div>
                  )}
                  <h2 className="hero-title">{slide.subtitle || slide.title}</h2>
                  <p className="hero-desc">{slide.description}</p>
                  <button className="btn btn-white btn-lg hero-cta">SHOP NOW</button>
                </div>
                <div className="hero-visual">
                  <span className="hero-emoji">{slide.emoji || '🎁'}</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
