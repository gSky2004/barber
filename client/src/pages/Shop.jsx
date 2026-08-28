import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../components/FadeIn';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';
import api from '../api/client';
import { images } from '../data/images';

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(images.featuredShop);
  const [shopFilter, setShopFilter] = useState('all');
  const [shopVisible, setShopVisible] = useState(12);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(images.featuredShop);
        }
      })
      .catch(() => setProducts(images.featuredShop))
      .finally(() => setLoadingProducts(false));
  }, []);

  const onOrderProduct = (e, product) => {
    e.preventDefault();
    sessionStorage.setItem('order-prefill', JSON.stringify(product));
    navigate('/order');
  };

  const filtered = products.filter((p) => shopFilter === 'all' || p.category === shopFilter);
  const visible = filtered.slice(0, shopVisible);
  const hasMore = filtered.length > shopVisible;

  return (
    <section id="shop" className="section pt-32">
      <FadeIn>
        <p className="eyebrow">Shop</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Shop & Play</h2>
        <p className="text-muted mt-4 max-w-2xl">
          Browse phones, accessories, electricals, and gaming sessions. Everyone can explore —
          log in or register to add to cart or buy.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-wrap gap-2 mt-8">
          {[
            { id: 'all', label: 'All' },
            { id: 'phone', label: 'Phone Store' },
            { id: 'electrical', label: 'Electrical' },
            { id: 'gaming', label: 'Play Games' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setShopFilter(f.id); setShopVisible(12); }}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                shopFilter === f.id
                  ? 'bg-primary text-black font-semibold'
                  : 'bg-white/10 text-muted hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {loadingProducts
          ? Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)
          : visible.length > 0
            ? visible.map((p, i) => (
              <ProductCard key={p.id} product={p} onOrderClick={onOrderProduct} index={i} />
            ))
            : (
              <p className="text-muted text-center py-10">No products in this category yet.</p>
            )}
      </div>
      {!loadingProducts && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setShopVisible((v) => v + 12)}
            className="btn btn-secondary px-8"
          >
            Show More
          </button>
        </div>
      )}
    </section>
  );
}
