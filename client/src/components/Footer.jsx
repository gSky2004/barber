import { useNavigate, useLocation } from 'react-router-dom';
import BrandMark from './BrandMark';
import { scrollToSection } from '../utils/scrollTo';

const links = [
  { id: 'services', label: 'Services' },
  { id: 'shop', label: 'Shop' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'book', label: 'Book Appointment' },
  { id: 'contact', label: 'Contact' },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const onNav = (e, id) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      scrollToSection(id);
      window.history.pushState(null, '', `/#${id}`);
    }
  };

  return (
    <footer className="border-t border-border mt-20 bg-black/30 backdrop-blur-md">
      <div className="section grid md:grid-cols-3 gap-10 pb-8">
        <div>
          <h3 className="mb-3">
            <BrandMark size="lg" />
          </h3>
          <p className="text-muted text-sm leading-relaxed">
            Technology, Grooming, Entertainment & Lifestyle Hub — barbershop, phone repair,
            accessories, gaming, and tech support in Mbeya, Tanzania.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted">
            {links.map((l) => (
              <a
                key={l.id}
                href={`/#${l.id}`}
                onClick={(e) => onNav(e, l.id)}
                className="hover:text-text transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <div className="text-sm text-muted space-y-2">
            <p>Mbeya City Centre, Tanzania</p>
            <p>Mon – Sun, 8:00 AM – 9:00 PM</p>
            <p>
              <a href="tel:+255765934051" className="hover:text-primary transition-colors">+255 765 934 051</a>
            </p>
            <p>
              <a
                href="https://wa.me/255765934051"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                WhatsApp Us
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Milestone Accessories. All rights reserved.
      </div>
    </footer>
  );
}
