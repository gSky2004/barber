import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '../components/FadeIn';
import OrderForm from '../components/OrderForm';
import { images } from '../data/images';

export default function Order() {
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderTab, setOrderTab] = useState('product');

  useEffect(() => {
    const saved = sessionStorage.getItem('order-prefill');
    if (saved) {
      try {
        const product = JSON.parse(saved);
        if (product && product.name) {
          setOrderProduct(product);
          setOrderTab('product');
        }
      } catch {
        // ignore malformed prefill
      }
      sessionStorage.removeItem('order-prefill');
    }
  }, []);

  const onClearPrefill = () => setOrderProduct(null);

  return (
    <section id="order" className="section pt-32">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <FadeIn direction="left">
          <p className="eyebrow">Orders</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Place an Order or Repair Request</h2>
          <p className="text-muted mt-4">
            {orderTab === 'product'
              ? 'Order phones and accessories for pickup or delivery in Mbeya.'
              : 'Describe your device issue — screen, battery, charging port, and more.'}
            {' '}Prefer pickup? Find our shop on the map in Contact.
          </p>
          <div className="relative mt-8 hidden lg:block aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={orderTab}
                className="absolute inset-0"
                initial={{ opacity: 0, x: orderTab === 'product' ? 80 : -80, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: orderTab === 'product' ? -60 : 60, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={orderTab === 'product' ? images.services.phoneStore : images.services.repair}
                  alt={orderTab === 'product' ? 'Phone store and accessories' : 'Phone repair service'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
        <FadeIn delay={0.1} direction="right">
          <OrderForm
            prefillProduct={orderProduct}
            onClearPrefill={onClearPrefill}
            onTabChange={setOrderTab}
          />
        </FadeIn>
      </div>
    </section>
  );
}
