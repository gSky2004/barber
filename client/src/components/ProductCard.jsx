import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageReveal from './ImageReveal';
import { formatTZS } from '../utils/format';
import { images } from '../data/images';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const fallbackImages = {
  phone: images.products.charger,
  electrical: images.products.bulb,
  gaming: images.services.gaming,
};

export default function ProductCard({ product, onOrderClick, index = 0 }) {
  const navigate = useNavigate();
  const { addToCart, buyNow, loading } = useCart();
  const { customer, isLoggedIn, openAuth } = useCustomerAuth();
  const [toast, setToast] = useState('');
  const [buying, setBuying] = useState(false);
  const [failed, setFailed] = useState(false);
  const from = index % 2 === 0 ? 'left' : 'right';

  const img =
    product.image_url?.startsWith('http') || product.image_url?.startsWith('/')
      ? product.image_url
      : fallbackImages[product.category] || images.products.charger;

  if (failed) return null;

  const handleAdd = async () => {
    if (String(product.id).startsWith('feat-')) {
      return;
    }
    if (!isLoggedIn) {
      openAuth('login', 'Log in or create an account to add items to your cart.');
      return;
    }
    const result = await addToCart(product, 1);
    if (result.needsAuth) {
      return;
    }
    if (result.ok) {
      setToast('Added to cart');
      setTimeout(() => setToast(''), 1800);
    } else if (result.error) {
      setToast(result.error);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleBuy = async () => {
    if (String(product.id).startsWith('feat-')) {
      return;
    }
    if (!isLoggedIn) {
      openAuth('login', '');
      return;
    }
    setBuying(true);
    try {
      const result = await buyNow(product, { phone: customer?.phone });
      if (result.needsAuth) {
        openAuth('login', '');
        return;
      }
      if (result.ok && result.path) {
        navigate(result.path);
        return;
      }
      if (result.error) {
        setToast(result.error);
        setTimeout(() => setToast(''), 2500);
      }
    } finally {
      setBuying(false);
    }
  };

  const handleOrder = (e) => {
    if (String(product.id).startsWith('feat-')) {
      onOrderClick?.(e, product);
      return;
    }
    if (!isLoggedIn) {
      openAuth('login', '');
      e.preventDefault();
      return;
    }
    onOrderClick?.(e, product);
  };

  return (
    <motion.div
      className="card group overflow-hidden p-0 relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.025, boxShadow: '0 26px 50px rgba(0,0,0,0.4)' }}
    >
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 right-3 z-10 text-center text-xs py-1.5 rounded-full bg-primary text-black font-semibold"
        >
          {toast}
        </motion.div>
      )}
      <div className="aspect-[4/3] bg-white/5 overflow-hidden relative">
        <ImageReveal
          src={img}
          alt={product.name}
          from={from}
          index={index}
          delay={(index % 4) * 0.05}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          wrapperClassName="absolute inset-0"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="p-4">
        <span className="text-xs uppercase tracking-wider text-accent">{product.category}</span>
        <h3 className="font-display font-semibold mt-1 text-sm sm:text-base">{product.name}</h3>
        <p className="text-muted text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
        <p className="text-primary font-bold mt-3">{formatTZS(product.price)}</p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading || buying}
            className="btn btn-secondary text-xs py-2 px-3 flex-1"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuy}
            disabled={loading || buying}
            className="btn btn-primary text-xs py-2 px-3 flex-1"
          >
            {buying ? 'Buying…' : 'Buy'}
          </button>
        </div>
        <button
          type="button"
          onClick={handleOrder}
          disabled={loading || buying}
          className="btn btn-accent text-xs py-2 px-3 w-full mt-2"
        >
          Order
        </button>
      </div>
    </motion.div>
  );
}
