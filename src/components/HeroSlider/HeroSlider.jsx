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
    title: 'Next Generation',
    subtitle: 'CRAFTSZONE PRO',
    description: 'Experience the cutting-edge of shopping with our new minimalist platform.',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    textDark: true,
    accent: '#4f46e5'
  },
  {
    id: 2,
    title: 'Sleek & Fast',
    subtitle: 'MODERN DESIGN',
    description: 'Lightning fast performance meets elegant minimalist design.',
    bg: '#ffffff',
    textDark: true,
    accent: '#0f172a'
  },
  {
    id: 3,
    title: 'Smart Features',
    subtitle: 'INTELLIGENT UI',
    description: 'Enhanced with fluid animations and intuitive glassmorphism.',
    bg: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
    textDark: true,
    accent: '#4f46e5'
  }
];

export default function HeroSlider({ banners }) {
  const slides = banners?.length > 0 ? banners : defaultSlides;

  return (
    <div className="hero-slider">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className={`hero-slide ${slide.textDark ? 'text-dark' : 'text-light'}`} 
              style={{ background: slide.bg || '#1a3c2a' }}
            >
              {/* Refined subtle noise texture */}
              <div className="hero-texture"></div>
              
              <div className="hero-slide-content">
                <div className="hero-text">
                  <h2 className="hero-title">{slide.subtitle}</h2>
                  {slide.title && (
                    <div className="hero-badge" style={{ color: slide.accent || '#b8860b' }}>
                      {slide.title}
                    </div>
                  )}
                  <p className="hero-desc">{slide.description}</p>
                  <button className={`btn btn-lg hero-cta ${slide.textDark ? 'btn-primary' : 'btn-white'}`}>
                    Discover More
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
