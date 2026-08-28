import { motion } from 'framer-motion';
import { FadeIn, Stagger, StaggerItem } from '../components/FadeIn';
import { Parallax } from '../components/Parallax';
import ImageReveal from '../components/ImageReveal';
import ContactForm from '../components/ContactForm';
import LocationMap from '../components/LocationMap';
import { images } from '../data/images';

export default function Contact() {
  return (
    <section id="contact" className="section pt-32">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <FadeIn direction="left">
          <p className="eyebrow">Get in Touch</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Contact Us</h2>
          <p className="text-muted mt-4 leading-relaxed">
            Visit us in Mbeya, call, WhatsApp, or send a message. We respond quickly and are happy to help
            with custom orders, bulk purchases, or special requests.
          </p>
          <Parallax speed={0.18} className="rounded-2xl mt-6 max-h-[260px]">
            <ImageReveal
              src={images.contact}
              alt="Contact Milestone Accessories"
              from="left"
              className="rounded-2xl w-full object-cover aspect-[16/9] max-h-[260px] scale-110"
              wrapperClassName="rounded-2xl"
            />
          </Parallax>
          <Stagger className="grid sm:grid-cols-2 gap-4 mt-6" delay={0.1}>
            <StaggerItem>
              <motion.div className="card h-full" whileHover={{ y: -4 }}>
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted text-sm mt-2">Mbeya City Centre, Tanzania</p>
                <p className="text-muted text-sm">Mon – Sun, 8:00 AM – 9:00 PM</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div className="card h-full" whileHover={{ y: -4 }}>
                <h3 className="font-semibold">Phone & WhatsApp</h3>
                <a href="tel:+255765934051" className="text-accent text-sm mt-2 block hover:underline">+255 765 934 051</a>
                <a href="https://wa.me/255765934051" target="_blank" rel="noopener noreferrer" className="text-accent text-sm block hover:underline">Chat on WhatsApp →</a>
              </motion.div>
            </StaggerItem>
          </Stagger>
        </FadeIn>
        <FadeIn delay={0.12} direction="right">
          <ContactForm />
        </FadeIn>
      </div>

      <FadeIn delay={0.15} direction="up">
        <div className="mt-10">
          <LocationMap
            title="Find us on the map"
            subtitle="Mbeya City Centre · Open 7 days a week"
            horizontal
          />
        </div>
      </FadeIn>
    </section>
  );
}
