import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn, Stagger, StaggerItem } from '../components/FadeIn';
import { Parallax, HeroParallax } from '../components/Parallax';
import ImageReveal from '../components/ImageReveal';
import ServiceCard from '../components/ServiceCard';
import BrandMark from '../components/BrandMark';
import TypingText from '../components/TypingText';
import { images, serviceList, stats } from '../data/images';

export default function Home() {
  const featuredServices = serviceList.slice(0, 3);

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
              <Link to="/book" className="btn btn-primary">Book Barber</Link>
              <Link to="/book" className="btn btn-accent" onClick={() => sessionStorage.setItem('book-tab', 'gaming')}>Reserve Gaming</Link>
              <Link to="/shop" className="btn btn-secondary">Shop Now</Link>
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
                fetchPriority="high"
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
            <div className="mt-8">
              <Link to="/about" className="btn btn-secondary">Learn More About Us</Link>
            </div>
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

      {/* SERVICES PREVIEW */}
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
          {featuredServices.map((s, i) => (
            <ServiceCard
              key={s.title}
              image={s.image}
              title={s.title}
              description={s.description}
              price={s.price}
              cta={s.cta}
              ctaLink={s.link}
              index={i}
            />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link to="/services" className="btn btn-primary px-8">View All Services</Link>
        </div>
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
              <Link to="/book" className="btn btn-primary">Book Now</Link>
              <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
            </div>
          </motion.div>
        </FadeIn>
      </section>
    </>
  );
}
