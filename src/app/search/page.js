'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard/ProductCard';
import { Search as SearchIcon, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import './search.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProducts(query);
        setProducts(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <div className="search-page">
      <div className="container">
        <header className="search-results-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="search-title">
            {query ? `Search results for "${query}"` : 'All Products'}
            <span className="results-count">({products.length} {products.length === 1 ? 'product' : 'products'} found)</span>
          </h1>
        </header>

        {loading ? (
          <div className="search-loading">
            <div className="spinner" />
            <p>Searching for the best gifts...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="search-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <Package size={64} />
            </div>
            <h2>No products found</h2>
            <p>We couldn't find anything matching "{query}". Try different keywords or browse our collections.</p>
            <div className="no-results-actions">
              <Link href="/collections/all" className="btn btn-primary">Browse All Products</Link>
              <Link href="/" className="btn btn-outline">Go to Homepage</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
