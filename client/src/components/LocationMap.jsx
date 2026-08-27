const DEFAULT_EMBED =
  'https://maps.google.com/maps?q=Mbeya+City+Centre,+Tanzania&z=15&output=embed';

export default function LocationMap({
  title = 'Find us in Mbeya',
  subtitle = 'Mbeya City Centre · Open Mon – Sun, 8:00 AM – 9:00 PM',
  embedUrl = DEFAULT_EMBED,
  className = '',
  horizontal = false,
}) {
  return (
    <div className={`card overflow-hidden p-0 ${className}`}>
      <div className={`${horizontal ? 'sm:flex sm:items-center sm:justify-between gap-4' : ''} p-5 border-b border-border`}>
        <div>
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <p className="text-muted text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`flex flex-wrap gap-3 text-sm ${horizontal ? 'mt-3 sm:mt-0' : 'mt-3'}`}>
          <a href="tel:+255765934051" className="text-accent hover:underline">+255 765 934 051</a>
          <a
            href="https://wa.me/255765934051"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            WhatsApp
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Mbeya+City+Centre+Tanzania"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
      <div className={`relative w-full bg-white/5 ${horizontal ? 'aspect-[21/9] min-h-[220px] max-h-[320px]' : 'aspect-[4/3]'}`}>
        <iframe
          title="Milestone Accessories location map"
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
