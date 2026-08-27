import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, Stagger, StaggerItem } from '../components/FadeIn';
import { Parallax, HeroParallax, ScrollReveal } from '../components/Parallax';
import ImageReveal from '../components/ImageReveal';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import { ProductSkeleton } from '../components/Skeleton';
import BookForm from '../components/BookForm';
import OrderForm from '../components/OrderForm';
import ContactForm from '../components/ContactForm';
import TypingText from '../components/TypingText';
import LocationMap from '../components/LocationMap';
import BrandMark from '../components/BrandMark';
import api from '../api/client';
import { images, serviceList, stats } from '../data/images';
import { handleNavClick, scrollToSection } from '../utils/scrollTo';
import { useHashScroll } from '../hooks/useHashScroll';

export default function Home() {
  const [products, setProducts] = useState(images.featuredShop);
  const [shopFilter, setShopFilter] = useState('all');
  const [shopVisible, setShopVisible] = useState(12);
  const [gallery, setGallery] = useState(
    images.gallery.map((g, i) => ({ id: i, image_url: g.url, caption: g.caption }))
  );
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderTab, setOrderTab] = useState('product');

  useHashScroll();

  useEffect(() => {
    api.get('/products')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const featuredNames = new Set(images.featuredShop.map((p) => p.name.toLowerCase()));
          const fromApi = data.filter((p) => !featuredNames.has(String(p.name || '').toLowerCase()));
          setProducts([...images.featuredShop, ...fromApi]);
        } else {
          setProducts(images.featuredShop);
        }
      })
      .catch(() => setProducts(images.featuredShop))
      .finally(() => setLoadingProducts(false));

    api.get('/gallery')
      .then((data) => {
        const local = images.gallery.map((g, i) => ({
          id: `local-${i}`,
          image_url: g.url,
          caption: g.caption,
        }));
        if (Array.isArray(data) && data.length > 0) {
          const localUrls = new Set(local.map((g) => g.image_url));
          const extras = data.filter((g) => g.image_url && !localUrls.has(g.image_url));
          setGallery([...local, ...extras]);
        } else {
          setGallery(local);
        }
      })
      .catch(() => setGallery(images.gallery.map((g, i) => ({
        id: `local-${i}`,
        image_url: g.url,
        caption: g.caption,
      }))))
      .finally(() => setLoadingGallery(false));
  }, []);

  const onSectionNav = (e, id) => handleNavClick(e, id, () => {}, '/');

  const onOrderProduct = (e, product) => {
    e.preventDefault();
    setOrderProduct(product);
    scrollToSection('order');
    window.history.pushState(null, '', '/#order');
  };

  return (
    <>
      {/* HERO */}
      <section id="home" className="section min-h-screen flex items-center pt-24 relative overflow-hidden">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 w-[360px] h-[360px] rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="grid lg:grid-cols-2 gap-10 items-center w-full relative">
          <FadeIn duration={0.7}>
            <p className="eyebrow">Mbeya&apos;s All-in-One Hub</p>
            <BrandMark size="hero" className="block mt-4 mb-3" stacked />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mt-2 min-h-[1.8em] md:min-h-[1.6em]">
              Your home for{' '}
              <TypingText className="text-primary" />
            </h1>
            <p className="text-muted mt-5 text-lg max-w-lg leading-relaxed">
              Phone store & repair, barbershop, gaming, football viewing,
              Moneypoint, software installs,home needs  and accessories — one stop for everything in Mbeya.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="#book" onClick={(e) => onSectionNav(e, 'book')} className="btn btn-primary">Book Barber</a>
              <a href="#book" onClick={(e) => { sessionStorage.setItem('book-tab', 'gaming'); onSectionNav(e, 'book'); }} className="btn btn-accent">Reserve Gaming</a>
              <a href="#shop" onClick={(e) => onSectionNav(e, 'shop')} className="btn btn-secondary">Shop Now</a>
            </div>
            <div className="flex flex-wrap gap-4 mt-8 text-sm text-muted">
              <span>✓ Open 7 Days</span>
              <span>✓ Fast Turnaround</span>
              <span>✓ Premium Service</span>
              <span>✓ Fair Mbeya Prices</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} direction="right" duration={0.75}>
            <HeroParallax className="relative">
              <ImageReveal
                src={images.hero}
                alt="Milestone Accessories barbershop and tech store"
                from="right"
                loading="eager"
                className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3]"
                wrapperClassName="rounded-3xl"
              />
              <motion.div
                className="absolute -bottom-4 -left-4 card py-3 px-5 hidden sm:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className="text-primary font-bold text-lg">8+ Services</p>
                <p className="text-muted text-xs">Under one roof</p>
              </motion.div>
            </HeroParallax>
          </FadeIn>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn direction="left">
            <p className="eyebrow">About Us</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              Built for modern convenience and bold style
            </h2>
            <p className="text-muted mt-4 leading-relaxed">
              Milestone Accessories was born to serve clients who want quality grooming, reliable device care,
              and lifestyle essentials in one premium location. From your morning haircut to fixing a cracked
              screen, buying a charger, or gaming with friends — we have you covered.
            </p>
            <Stagger className="grid sm:grid-cols-3 gap-4 mt-8" delay={0.15}>
              <StaggerItem>
                <motion.div className="card h-full" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <h3 className="font-semibold text-primary">Our Story</h3>
                  <p className="text-muted text-sm mt-2">Started in Mbeya to combine grooming, tech, and entertainment under one trusted brand.</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="card h-full" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <h3 className="font-semibold text-primary">Mission</h3>
                  <p className="text-muted text-sm mt-2">Deliver fast, reliable, premium experiences with innovation and genuine hospitality.</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="card h-full" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <h3 className="font-semibold text-primary">Vision</h3>
                  <p className="text-muted text-sm mt-2">Become Mbeya&apos;s go-to hub for style, device care, and community-driven services.</p>
                </motion.div>
              </StaggerItem>
            </Stagger>
          </FadeIn>
          <FadeIn delay={0.15} direction="right">
            <Parallax speed={0.28} className="rounded-3xl shadow-xl">
              <ImageReveal
                src={images.about}
                alt="Milestone Accessories team and workspace"
                from="right"
                className="rounded-3xl w-full object-cover aspect-[4/5] scale-110"
                wrapperClassName="rounded-3xl"
              />
            </Parallax>
          </FadeIn>
        </div>
        </ScrollReveal>
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14" stagger={0.1}>
          {stats.map((s) => (
            <StaggerItem key={s.label} direction="scale">
              <motion.div
                className="card text-center py-6"
                whileHover={{ y: -6, borderColor: 'rgba(212,175,55,0.4)' }}
              >
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-muted text-sm mt-1">{s.label}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* SERVICES */}
      <section id="services" className="section">
        <FadeIn>
          <p className="eyebrow text-center">What We Offer</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mt-2">
            Everything under one roof
          </h2>
          <p className="text-muted text-center mt-4 max-w-2xl mx-auto">
            Phone store & repair, barbershop, gaming, football viewing, Moneypoint, software installs, and accessories.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {serviceList.map((s, i) => (
            <ServiceCard
              key={s.title}
              image={s.image}
              title={s.title}
              description={s.description}
              price={s.price}
              cta={s.cta}
              ctaLink={s.link}
              onCtaClick={onSectionNav}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="section">
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

        {(() => {
          const filtered = products.filter((p) => shopFilter === 'all' || p.category === shopFilter);
          const visible = filtered.slice(0, shopVisible);
          const hasMore = filtered.length > shopVisible;
          return (
            <>
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
            </>
          );
        })()}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section">
        <FadeIn>
          <p className="eyebrow">Gallery</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Inside <span className="text-primary">Milestone Accessories</span></h2>
          <p className="text-muted mt-4">Our barbershop, repair bench, gaming lounge, and accessory displays.</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {loadingGallery
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl shimmer" />
            ))
            : gallery.map((img, i) => (
              <button
                key={img.id || i}
                type="button"
                className="relative aspect-square rounded-2xl overflow-hidden group w-full p-0 border-0 bg-transparent cursor-pointer"
                onClick={() => setLightbox(img)}
              >
                <ImageReveal
                  src={img.image_url}
                  alt={img.caption || 'Gallery'}
                  from={i % 2 === 0 ? 'left' : 'right'}
                  index={i}
                  delay={(i % 3) * 0.08}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  wrapperClassName="absolute inset-0 rounded-2xl h-full"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-left z-[2]">
                    <p className="text-sm">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
        </div>
      </section>

      <TestimonialCarousel />

      {/* BOOK */}
      <section id="book" className="section">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <FadeIn direction="left">
            <p className="eyebrow">Reservations</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Book Appointment</h2>
            <p className="text-muted mt-4 leading-relaxed">
              Reserve your barber slot for a fresh cut or book a gaming session on our PlayStation setup.
              We confirm all bookings by phone within a few hours.
            </p>
            <Parallax speed={0.22} className="rounded-2xl mt-8 max-h-[420px]">
              <ImageReveal
                src={images.book}
                alt="Book your barbershop appointment"
                from="left"
                className="rounded-2xl w-full object-cover aspect-[4/3] max-h-[420px] scale-110"
                wrapperClassName="rounded-2xl"
              />
            </Parallax>
          </FadeIn>
          <FadeIn delay={0.12} direction="right">
            <BookForm />
          </FadeIn>
        </div>
      </section>

      {/* ORDER */}
      <section id="order" className="section">
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
              onClearPrefill={() => setOrderProduct(null)}
              onTabChange={setOrderTab}
            />
          </FadeIn>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <FadeIn direction="left">
            <p className="eyebrow">Get in Touch</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Contact Us</h2>
            <p className="text-muted mt-4 leading-relaxed">
              Visit us in Mbeya, call, WhatsApp, or send a message. We respond quickly and are happy to help
              with custom orders, bulk purchases, or special requests.
            </p>
            <Parallax speed={0.18} className="rounded-2xl mt-6 max-h-[260px]">
              <ImageReveal
                src={images.contact}
                alt="Contact Milestone Accessories"
                from="left"
                className="rounded-2xl w-full object-cover aspect-[16/9] max-h-[260px] scale-110"
                wrapperClassName="rounded-2xl"
              />
            </Parallax>
            <Stagger className="grid sm:grid-cols-2 gap-4 mt-6" delay={0.1}>
              <StaggerItem>
                <motion.div className="card h-full" whileHover={{ y: -4 }}>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-muted text-sm mt-2">Mbeya City Centre, Tanzania</p>
                  <p className="text-muted text-sm">Mon – Sun, 8:00 AM – 9:00 PM</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="card h-full" whileHover={{ y: -4 }}>
                  <h3 className="font-semibold">Phone & WhatsApp</h3>
                  <a href="tel:+255765934051" className="text-accent text-sm mt-2 block hover:underline">+255 765 934 051</a>
                  <a href="https://wa.me/255765934051" target="_blank" rel="noopener noreferrer" className="text-accent text-sm block hover:underline">Chat on WhatsApp →</a>
                </motion.div>
              </StaggerItem>
            </Stagger>
          </FadeIn>
          <FadeIn delay={0.12} direction="right">
            <ContactForm />
          </FadeIn>
        </div>

        <FadeIn delay={0.15} direction="up">
          <div className="mt-10">
            <LocationMap
              title="Find us on the map"
              subtitle="Mbeya City Centre · Open 7 days a week"
              horizontal
            />
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="section pb-24">
        <FadeIn direction="scale">
          <motion.div
            className="card text-center py-14 px-6 bg-gradient-to-r from-accent/10 to-primary/10"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold">Ready to visit Milestone?</h2>
            <p className="text-muted mt-3 max-w-md mx-auto">
              Walk in anytime or book ahead. Your style, your devices, your entertainment — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a href="#book" onClick={(e) => onSectionNav(e, 'book')} className="btn btn-primary">Book Now</a>
              <a href="#contact" onClick={(e) => onSectionNav(e, 'contact')} className="btn btn-secondary">Get in Touch</a>
            </div>
          </motion.div>
        </FadeIn>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.image_url}
              alt={lightbox.caption || ''}
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
            <button className="absolute top-6 right-6 text-white text-3xl" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
