import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left pointer-events-none"
      style={{ scaleX, opacity: visible ? 1 : 0 }}
    >
      <div className="h-full w-full bg-gradient-to-r from-primary via-primary-light to-accent shadow-[0_0_12px_rgba(212,175,55,0.55)]" />
    </motion.div>
  );
}
