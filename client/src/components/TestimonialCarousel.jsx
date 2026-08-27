import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import api from '../api/client';
import { FadeIn } from './FadeIn';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format',
];

const FALLBACK = [
  {
    id: 1,
    customer_name: 'James M.',
    message: 'Best barbershop in Mbeya! Clean cuts every time and great conversation.',
    rating: 5,
    photo: AVATARS[0],
  },
  {
    id: 2,
    customer_name: 'Amina K.',
    message: 'Fixed my phone screen in under an hour. Professional and affordable.',
    rating: 5,
    photo: AVATARS[1],
  },
  {
    id: 3,
    customer_name: 'David L.',
    message: 'The gaming station is amazing — book ahead on weekends!',
    rating: 4,
    photo: AVATARS[2],
  },
  {
    id: 4,
    customer_name: 'Grace N.',
    message: 'Wide range of accessories at fair prices. Highly recommend.',
    rating: 5,
    photo: AVATARS[3],
  },
  {
    id: 5,
    customer_name: 'Peter S.',
    message: 'Software install was fast and my laptop runs like new again.',
    rating: 5,
    photo: AVATARS[4],
  },
  {
    id: 6,
    customer_name: 'Neema J.',
    message: 'Friendly staff, fair prices, and everything under one roof.',
    rating: 5,
    photo: AVATARS[5],
  },
];

function TestimonialCard({ item, index = 0 }) {
  const from = index % 2 === 0 ? 'left' : 'right';
  return (
    <motion.article
      className="card h-full flex flex-col items-center text-center p-5 relative overflow-hidden"
      initial={{ opacity: 0, x: from === 'left' ? -36 : 36 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 18px 36px rgba(0,0,0,0.3)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
      <div className="relative flex flex-col items-center flex-1 w-full">
        <motion.img
          src={item.photo}
          alt={item.customer_name}
          className="w-14 h-14 rounded-full object-cover border-2 border-primary/80 shadow-md mb-3"
          loading="lazy"
          initial={{ opacity: 0, x: from === 'left' ? -24 : 24, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        />
        <div className="flex justify-center gap-0.5 mb-2">
          {Array.from({ length: item.rating || 5 }).map((_, i) => (
            <span key={i} className="text-primary text-sm">★</span>
          ))}
        </div>
        <p className="text-sm text-muted leading-relaxed italic line-clamp-4 flex-1">
          &ldquo;{item.message}&rdquo;
        </p>
        <p className="font-display font-semibold text-sm mt-4">{item.customer_name}</p>
      </div>
    </motion.article>
  );
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(3);
  const [animating, setAnimating] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(3);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  useEffect(() => {
    api
      .get('/testimonials')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(
            data.map((t, i) => ({
              ...t,
              photo: t.photo || t.image_url || AVATARS[i % AVATARS.length],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const count = testimonials.length;
  // Clone first `visible` cards at the end for seamless left wrap
  const loopItems =
    count > 0
      ? [...testimonials, ...testimonials.slice(0, visible)]
      : [];

  const slideLeft = useCallback(async () => {
    if (animating || count === 0) return;
    setAnimating(true);
    const next = index + 1;
    await controls.start({
      x: `-${(next * 100) / visible}%`,
      transition: { duration: 0.45, ease: 'easeInOut' },
    });

    if (next >= count) {
      // Jump back to start without animation (cards that left reappear on the right)
      controls.set({ x: '0%' });
      setIndex(0);
    } else {
      setIndex(next);
    }
    setAnimating(false);
  }, [animating, count, index, visible, controls]);

  const slideRight = useCallback(async () => {
    if (animating || count === 0) return;
    setAnimating(true);

    if (index === 0) {
      // Jump to cloned end, then animate left into last real set... 
      // For "prev": jump to clone position then animate one step left visually as going back.
      // Simpler prev: jump to end position without showing right-slide, then user sees previous cards via left jump+animate.
      controls.set({ x: `-${(count * 100) / visible}%` });
      const target = count - 1;
      await controls.start({
        x: `-${(target * 100) / visible}%`,
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
      setIndex(target);
    } else {
      const prev = index - 1;
      await controls.start({
        x: `-${(prev * 100) / visible}%`,
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
      setIndex(prev);
    }
    setAnimating(false);
  }, [animating, count, index, visible, controls]);

  // Keep track position in sync when visible/count changes
  useEffect(() => {
    controls.set({ x: `-${(index * 100) / visible}%` });
  }, [visible, count, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (count <= visible || paused || animating) return undefined;
    const timer = setInterval(() => {
      slideLeft();
    }, 4000);
    return () => clearInterval(timer);
  }, [count, visible, paused, animating, slideLeft]);

  useEffect(() => {
    if (!paused) return undefined;
    const resume = setTimeout(() => setPaused(false), 8000);
    return () => clearTimeout(resume);
  }, [paused, index]);

  if (count === 0) return null;

  const cardWidth = `${100 / visible}%`;

  return (
    <section id="testimonials" className="section">
      <FadeIn>
        <p className="eyebrow text-center">Testimonials</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mt-2 mb-8">
          What our customers say
        </h2>
      </FadeIn>

      <FadeIn delay={0.1} direction="scale">
      <div
        className="relative max-w-6xl mx-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Exact 3 slots — no peek of a 4th card */}
        <div className="overflow-hidden mx-10 sm:mx-12">
          <motion.div className="flex" animate={controls} initial={{ x: '0%' }}>
            {loopItems.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="shrink-0 box-border px-1.5"
                style={{ width: cardWidth, flex: `0 0 ${cardWidth}` }}
              >
                <TestimonialCard item={item} index={i} />
              </div>
            ))}
          </motion.div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                slideRight();
              }}
              disabled={animating}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/50 border border-border/70 backdrop-blur-md text-text shadow-lg hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center justify-center disabled:opacity-50"
              aria-label="Previous testimonials"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                slideLeft();
              }}
              disabled={animating}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/50 border border-border/70 backdrop-blur-md text-text shadow-lg hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center justify-center disabled:opacity-50"
              aria-label="Next testimonials"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      </FadeIn>
    </section>
  );
}
