import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageReveal from './ImageReveal';

function resolveRoute(ctaLink) {
  if (!ctaLink || !ctaLink.startsWith('#')) return ctaLink;
  return ctaLink.replace('#', '/');
}

export default function ServiceCard({
  image,
  icon,
  title,
  description,
  price,
  cta,
  ctaLink,
  index = 0,
}) {
  const imgSrc = image || icon;
  const from = index % 2 === 0 ? 'left' : 'right';

  return (
    <motion.div
      className="card h-full flex flex-col overflow-hidden p-0 group"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, boxShadow: '0 28px 56px rgba(0,0,0,0.4)' }}
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <ImageReveal
          src={imgSrc}
          alt={title}
          from={from}
          index={index}
          delay={(index % 3) * 0.06}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          wrapperClassName="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-lg">{title}</h3>
        <p className="text-muted text-sm mt-2 flex-1 leading-relaxed">{description}</p>
        {price && <p className="text-primary font-semibold mt-3 text-sm">{price}</p>}
        {cta && (
          <Link to={resolveRoute(ctaLink) || '/'} className="btn btn-secondary text-sm mt-4 self-start">
            {cta}
          </Link>
        )}
      </div>
    </motion.div>
  );
}

