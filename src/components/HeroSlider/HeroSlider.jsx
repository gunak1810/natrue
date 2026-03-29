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
    bg: 'linear-gradient(135deg, #1a2a3a 0%, #0d1b2a 100%)',
    accent: '#E91E63',
    emoji: '🎁'
  },
  {
    id: 2,
    title: 'Return Gifts',
    subtitle: 'Starting ₹20',
    description: '1200+ options • Free Gift Wrapping',
    bg: 'linear-gradient(135deg, #2B9A8C 0%, #1a7a6c 100%)',
    accent: '#FFB800',
    emoji: '🎉'
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Trendy Collection',
    description: 'Discover the latest gifts & stationery',
    bg: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
    accent: '#FFFFFF',
    emoji: '✨'
  },
  {
    id: 4,
    title: 'Corporate Gifts',
    subtitle: 'Personalized',
    description: 'Pen, Keychain & Diary combos with your logo',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#3DB8A8',
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
            <div className="hero-slide" style={{ background: slide.bg || `linear-gradient(135deg, #2B9A8C, #1a7a6c)` }}>
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
