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
    title: 'Certified Organic',
    subtitle: 'FARM TO TABLE',
    description: 'Pure, natural, and chemical-free ingredients for your kitchen.',
    bg: '#1a3c2a',
    accent: '#b8860b'
  },
  {
    id: 2,
    title: 'Pure Oils & Honey',
    subtitle: "NATURE'S GOLD",
    description: 'Cold-pressed oils and raw, unprocessed honey from sustainable farms.',
    bg: '#faf9f6',
    textDark: true,
    accent: '#946b08'
  },
  {
    id: 3,
    title: 'New Harvest',
    subtitle: 'SEASONAL FRESH',
    description: 'Freshly sourced millets, ancient grains, and powerful superfoods.',
    bg: '#0f2419',
    accent: '#b8860b'
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
