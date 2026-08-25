export default function BrandMark({
  className = '',
  size = 'md',
  showDot = true,
  stacked = false,
}) {
  const sizes = {
    sm: 'text-base md:text-lg',
    md: 'text-lg md:text-xl',
    lg: 'text-2xl md:text-3xl',
    hero: 'text-3xl sm:text-4xl md:text-5xl',
  };

  return (
    <span
      className={`font-brand font-semibold tracking-[0.04em] leading-none ${sizes[size] || sizes.md} ${className}`}
    >
      {stacked ? (
        <span className="inline-flex flex-col items-start gap-0.5">
          <span>
            Milestone
            {showDot && <span className="text-primary">.</span>}
          </span>
          <span className="text-[0.55em] uppercase tracking-[0.28em] text-primary font-medium">
            Accessories
          </span>
        </span>
      ) : (
        <>
          Milestone{' '}
          <span className="text-primary font-medium">Accessories</span>
          {showDot && <span className="text-primary">.</span>}
        </>
      )}
    </span>
  );
}
