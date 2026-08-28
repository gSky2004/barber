import { FadeIn } from '../components/FadeIn';
import { Parallax } from '../components/Parallax';
import ImageReveal from '../components/ImageReveal';
import BookForm from '../components/BookForm';
import { images } from '../data/images';

export default function Book() {
  return (
    <section id="book" className="section pt-32">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <FadeIn direction="left">
          <p className="eyebrow">Reservations</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Book Appointment</h2>
          <p className="text-muted mt-4 leading-relaxed">
            Reserve your barber slot for a fresh cut or book a gaming session on our PlayStation setup.
            We confirm all bookings by phone within a few hours.
          </p>
          <Parallax speed={0.22} className="rounded-2xl mt-8 max-h-[420px]">
            <ImageReveal
              src={images.book}
              alt="Book your barbershop appointment"
              from="left"
              className="rounded-2xl w-full object-cover aspect-[4/3] max-h-[420px] scale-110"
              wrapperClassName="rounded-2xl"
            />
          </Parallax>
        </FadeIn>
        <FadeIn delay={0.12} direction="right">
          <BookForm />
        </FadeIn>
      </div>
    </section>
  );
}
