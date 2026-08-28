import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn, Stagger, StaggerItem } from '../components/FadeIn';
import { Parallax } from '../components/Parallax';
import ImageReveal from '../components/ImageReveal';
import { images, stats } from '../data/images';

export default function About() {
  return (
    <section id="about" className="section pt-32">
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

      <div className="flex flex-wrap justify-center gap-3 mt-12">
        <Link to="/services" className="btn btn-primary">Explore Services</Link>
        <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
      </div>
    </section>
  );
}
