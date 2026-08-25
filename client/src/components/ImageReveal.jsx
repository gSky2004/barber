import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/**
 * Image that slides in from left/right on scroll, with a soft load fade.
 * from: 'left' | 'right' | 'auto' (auto alternates by index)
 */
export default function ImageReveal({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  from = 'left',
  index = 0,
  delay = 0,
  distance = 72,
  once = true,
  loading = 'lazy',
  ...imgProps
}) {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const side = from === 'auto' ? (index % 2 === 0 ? 'left' : 'right') : from;
  const x = side === 'left' ? -distance : distance;

  if (reduce) {
    return (
      <div className={`overflow-hidden ${wrapperClassName}`}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={className}
          onLoad={() => setLoaded(true)}
          {...imgProps}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${wrapperClassName}`}
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, amount: 0.15, margin: '0px 0px -30px 0px' }}
      transition={{ duration: 0.7, ease, delay }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-white/5 via-primary/20 to-white/5"
        animate={{ opacity: loaded ? 0 : 0.85 }}
        transition={{ duration: 0.5, ease }}
      />
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        className={className}
        initial={{ scale: 1.1, filter: 'blur(8px)', opacity: 0.45 }}
        animate={{
          scale: loaded ? 1 : 1.06,
          filter: loaded ? 'blur(0px)' : 'blur(5px)',
          opacity: loaded ? 1 : 0.65,
        }}
        transition={{ duration: 0.75, ease, delay: delay + 0.05 }}
        onLoad={() => setLoaded(true)}
        {...imgProps}
      />
    </motion.div>
  );
}
