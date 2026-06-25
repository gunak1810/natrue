'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProducts, getCategoryBySlug, getCategories } from '@/lib/firestore';
import { SlidersHorizontal, Grid3X3, Grid2X2 } from 'lucide-react';
import './collections.css';

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug;
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        let prods;
        if (slug === 'all') {
          prods = await getProducts({});
          setCategory({ name: 'All Products', description: 'Browse our complete collection' });
        } else {
          const cat = await getCategoryBySlug(slug);
          setCategory(cat);
          if (cat) {
            prods = await getProducts({ category: cat.name });
          } else {
            prods = [];
          }
        }
        setProducts(prods);
      } catch (err) {
        console.error('Error:', err);
        const allProds = await getProducts({});
        setProducts(allProds);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high': return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const filteredProducts = sortedProducts.filter(p => {
    const price = p.salePrice || p.price;
    switch (priceRange) {
      case 'under50': return price < 50;
      case 'under100': return price < 100;
      case '100-200': return price >= 100 && price <= 200;
      case '200-500': return price >= 200 && price <= 500;
      case 'above500': return price > 500;
      default: return true;
    }
  });

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div className="collection-page">
      {/* Header */}
      <div className="collection-header">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <span>{category?.name || slug}</span>
          </div>
          <h1 className="collection-title">{category?.name || slug}</h1>
          {category?.description && <p className="collection-desc">{category.description}</p>}
        </div>
      </div>

      <div className="container">
        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filters-left">
            <SlidersHorizontal size={18} />
            <span>{filteredProducts.length} products</span>
          </div>
          <div className="filters-right">
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="filter-select">
              <option value="all">All Prices</option>
              <option value="under50">Under ₹50</option>
              <option value="under100">Under ₹100</option>
              <option value="100-200">₹100 - ₹200</option>
              <option value="200-500">₹200 - ₹500</option>
              <option value="above500">Above ₹500</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Best Rating</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-grid collection-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or browse all products</p>
            <Link href="/collections/all" className="btn btn-primary">View All Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
