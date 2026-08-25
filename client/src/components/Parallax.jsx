import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Scroll-linked vertical parallax for a child (usually an image).
 * speed: positive = moves slower than scroll (classic depth), negative = opposite.
 */
export function Parallax({
  children,
  className = '',
  speed = 0.2,
  offset = ['start end', 'end start'],
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [speed * 80, speed * -80]);
  const y = useSpring(rawY, { stiffness: 90, damping: 28, restDelta: 0.001 });

  if (reduce) {
    return <div className={`overflow-hidden ${className}`}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Soft fade + rise as the section scrolls through the viewport */
export function ScrollReveal({ children, className = '', yRange = [48, 0, -24] }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.35, 1, 1, 0.55]);
  const y = useTransform(scrollYProgress, [0, 0.35, 1], yRange);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity: smoothOpacity, y: smoothY }}
    >
      {children}
    </motion.div>
  );
}

/** Subtle scale/parallax for hero media tied to page scroll */
export function HeroParallax({ children, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 28 });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: smoothY, scale, opacity }}
    >
      {children}
    </motion.div>
  );
}
