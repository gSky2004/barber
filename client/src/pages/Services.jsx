import { Link } from 'react-router-dom';
import { FadeIn } from '../components/FadeIn';
import ServiceCard from '../components/ServiceCard';
import { serviceList } from '../data/images';

export default function Services() {
  return (
    <section id="services" className="section pt-32">
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
        {serviceList.map((s, i) => (
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
      <div className="flex flex-wrap justify-center gap-3 mt-12">
        <Link to="/shop" className="btn btn-primary">Shop Now</Link>
        <Link to="/book" className="btn btn-secondary">Book an Appointment</Link>
      </div>
    </section>
  );
}
