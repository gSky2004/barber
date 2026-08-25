import { motion } from 'framer-motion';

const easings = [0.22, 1, 0.36, 1];

const presets = {
  up: { hidden: { opacity: 0, y: 56 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -56 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 56 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
};

export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.55,
  once = true,
}) {
  const variant = presets[direction] || presets.up;

  return (
    <motion.div
      className={className}
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2, margin: '0px 0px -40px 0px' }}
      transition={{ duration, ease: easings, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = '', delay = 0, stagger = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -30px 0px' }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', direction = 'up' }) {
  const variant = presets[direction] || presets.up;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: variant.hidden,
        show: variant.show,
      }}
      transition={{ duration: 0.5, ease: easings }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
