'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { getCategories, getProducts } from '@/lib/firestore';
import './categories.css';

// A component that handles the continuous crossfading of images
function AnimatedCollage({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    // Cycle image every 4 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="collage-empty">
        <ImageIcon size={48} opacity={0.5} />
      </div>
    );
  }

  return (
    <>
      {images.map((img, index) => (
        <img 
          key={index}
          src={img}
          alt={`Collage image ${index}`}
          className={`collage-image ${index === currentIndex ? 'active' : ''}`}
        />
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts() // Fetching all products to group their images by category
        ]);
        
        // Map products by category slug to get a list of images for each category
        const imagesMap = {};
        cats.forEach(cat => {
          // Find products that match this category slug
          const catProducts = prods.filter(p => p.category === cat.slug || p.category === cat.id);
          // Extract their main images (limit to 5 to avoid overloading DOM)
          const images = catProducts
            .filter(p => p.image || (p.images && p.images.length > 0))
            .map(p => p.image || p.images[0])
            .slice(0, 5);
          
          // If category has its own cover image, include it first
          if (cat.image) {
            images.unshift(cat.image);
          }
          
          imagesMap[cat.id] = images;
        });

        setCategories(cats);
        setCategoryImages(imagesMap);
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="categories-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-gray)' }}>Loading Categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-container fade-in">
        <div className="categories-header">
          <h1>Shop by Category</h1>
          <p>Discover our wide range of pure, organic essentials sourced directly from nature.</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => {
            const images = categoryImages[cat.id] || [];
            
            return (
              <Link href={`/collections/${cat.slug || cat.id}`} key={cat.id} className="category-card">
                <div className="collage-container">
                  <AnimatedCollage images={images} />
                </div>
                <div className="category-info">
                  <h3 className="category-title">{cat.name}</h3>
                  {cat.description && (
                    <p className="category-subtitle">{cat.description.substring(0, 60)}...</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
