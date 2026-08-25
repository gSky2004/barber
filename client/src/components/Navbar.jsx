import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandMark from './BrandMark';
import { scrollToSection } from '../utils/scrollTo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';
import UserBadge from './UserBadge';

const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'shop', label: 'Shop' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'book', label: 'Book' },
  { id: 'order', label: 'Order' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isLoggedIn, openAuth, logout } = useCustomerAuth();
  const { count, setCartOpen } = useCart();
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = links.map((l) => l.id);

    const updateActive = () => {
      const offset = 120; // navbar + breathing room
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) {
          current = id;
        }
      }

      // Near bottom of page → force last section (contact)
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (nearBottom) {
        current = sectionIds[sectionIds.length - 1];
      }

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const onNav = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    setActiveSection(id);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      scrollToSection(id);
      window.history.pushState(null, '', `/#${id}`);
    }
  };

  const openCartOrAuth = () => {
    if (!isLoggedIn) {
      openAuth('login', 'Log in or register to view your cart and place orders.');
      return;
    }
    setCartOpen(true);
  };

  const isActive = (id) => location.pathname === '/' && activeSection === id;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-black/50 backdrop-blur-xl shadow-lg border-b border-border'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-3">
        <a
          href="/#home"
          onClick={(e) => onNav(e, 'home')}
          className="shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Milestone Accessories home"
        >
          <BrandMark size="md" />
        </a>

        <nav ref={navRef} className="hidden xl:flex items-center gap-1 relative">
          {links.map((link) => (
            <a
              key={link.id}
              href={`/#${link.id}`}
              onClick={(e) => onNav(e, link.id)}
              className={`relative px-2.5 py-2 text-sm transition-colors hover:text-text ${
                isActive(link.id) ? 'text-primary' : 'text-muted'
              }`}
            >
              {link.label}
              {isActive(link.id) && (
                <motion.span
                  layoutId="nav-active-line"
                  className="absolute left-2 right-2 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-primary to-primary-light"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={openCartOrAuth}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
            aria-label="Open cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-4 px-1 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <UserBadge name={customer?.full_name || 'Member'} />
              <button type="button" onClick={logout} className="btn btn-secondary text-xs py-2 px-3">
                Log out
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => openAuth('login')} className="btn btn-secondary text-xs py-2 px-3">
                Log In
              </button>
              <button type="button" onClick={() => openAuth('register')} className="btn btn-primary text-xs py-2 px-3">
                Register
              </button>
            </>
          )}
        </div>

        <div className="flex xl:hidden items-center gap-2">
          <button
            type="button"
            onClick={openCartOrAuth}
            className="relative p-2 lg:hidden"
            aria-label="Open cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute top-0 right-0 min-w-[1rem] h-3.5 px-1 rounded-full bg-primary text-black text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            className="p-2 text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="xl:hidden fixed inset-y-0 right-0 w-72 bg-black/80 backdrop-blur-xl border-l border-border p-6 pt-20 flex flex-col gap-1 z-50 overflow-y-auto"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <a
                  href={`/#${link.id}`}
                  onClick={(e) => onNav(e, link.id)}
                  className={`relative block text-lg py-2.5 pl-1 ${
                    isActive(link.id) ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {link.label}
                  {isActive(link.id) && (
                    <motion.span
                      layoutId="nav-mobile-line"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </motion.div>
            ))}
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {isLoggedIn ? (
                <>
                  <UserBadge name={customer?.full_name || 'Member'} compact />
                  <button type="button" onClick={logout} className="btn btn-secondary w-full text-sm">Log out</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setMenuOpen(false); openAuth('login'); }} className="btn btn-secondary w-full text-sm">Log In</button>
                  <button type="button" onClick={() => { setMenuOpen(false); openAuth('register'); }} className="btn btn-primary w-full text-sm">Register</button>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
