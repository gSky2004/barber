import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '../components/FadeIn';
import ImageReveal from '../components/ImageReveal';
import api from '../api/client';
import { images } from '../data/images';

export default function Gallery() {
  const [gallery, setGallery] = useState(
    images.gallery.map((g, i) => ({ id: i, image_url: g.url, caption: g.caption }))
  );
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [hidden, setHidden] = useState(new Set());

  const onImageError = (img) => {
    setHidden((prev) => new Set(prev).add(img.id || img.image_url));
  };

  const visible = gallery.filter((img) => !hidden.has(img.id || img.image_url));

  useEffect(() => {
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

  return (
    <section id="gallery" className="section pt-32">
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
          : visible.map((img, i) => (
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
                onError={() => onImageError(img)}
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-left z-[2]">
                  <p className="text-sm">{img.caption}</p>
                </div>
              )}
            </button>
          ))}
      </div>

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
    </section>
  );
}
