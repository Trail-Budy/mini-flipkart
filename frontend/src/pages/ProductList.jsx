import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SkeletonProductGrid } from '../components/LoadingSkeleton';
import { Smartphone, Laptop, Tv, Shirt, Home, Coffee, Headphones, ChevronRight } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, searchParam]);

  const fetchCategories = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (categoryParam) params.append('category', categoryParam);
      if (searchParam) params.append('search', searchParam);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const categoryIcons = {
    'Mobiles': <Smartphone size={24} />,
    'Laptops': <Laptop size={24} />,
    'Electronics': <Tv size={24} />,
    'Fashion': <Shirt size={24} />,
    'Home': <Home size={24} />,
    'Appliances': <Coffee size={24} />,
    'Audio': <Headphones size={24} />
  };

  const isFiltering = categoryParam || searchParam;

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* Categories Bar */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="page-container" style={{ padding: '16px 20px', display: 'flex', gap: '32px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          
          <div 
            onClick={clearFilters}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '70px',
              color: !categoryParam ? 'var(--primary)' : 'var(--text-main)'
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={28} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: !categoryParam ? '600' : '500' }}>All</span>
          </div>

          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setSearchParams({ category: cat.id })}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '70px',
                color: parseInt(categoryParam) === cat.id ? 'var(--primary)' : 'var(--text-main)'
              }}
              className="category-icon-hover"
            >
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}>
                {categoryIcons[cat.name] || <Package size={24} />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: parseInt(categoryParam) === cat.id ? '600' : '500' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section (Only show if not filtering/searching) */}
      {!isFiltering && (
        <div className="page-container" style={{ paddingTop: '24px' }}>
          <div style={{ 
            height: '350px', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #2874f0 0%, #1e5bbd 100%)',
            color: 'white',
            position: 'relative'
          }}>
            <div style={{ padding: '60px', zIndex: 1, maxWidth: '600px' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'white', lineHeight: '1.1' }}>
                Everything you need.<br/>One place.
              </h1>
              <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9 }}>
                Discover great products at prices you'll love. Upgrade your tech, home, and lifestyle today.
              </p>
              <button className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                Shop Now <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Abstract Design Elements */}
            <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ position: 'absolute', right: '150px', bottom: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="page-container" style={{ paddingTop: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {searchParam ? `Search Results for "${searchParam}"` : 
               categoryParam ? `${categories.find(c => c.id === parseInt(categoryParam))?.name || 'Category'} Products` : 
               'Featured Products'}
            </h2>
            <div style={{ color: 'var(--text-muted)' }}>
              Showing {products.length} {products.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          {isFiltering && (
            <button onClick={clearFilters} className="btn btn-outline" style={{ padding: '8px 16px' }}>
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: '40px', backgroundColor: '#ffebee', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: '500' }}>
            Oops! {error}. Please try again.
          </div>
        )}

        {loading ? (
          <SkeletonProductGrid count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn btn-primary">View All Products</button>
          </div>
        )}

      </div>
      
      {/* Reusable Icon Package for All */}
      <style>{`
        .category-icon-hover:hover div {
          transform: scale(1.1);
          background-color: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

// Simple icon for 'All'
const Package = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;

export default ProductList;
