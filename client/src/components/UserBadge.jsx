function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAccent(name = '') {
  const accents = [
    'from-[#d4af37] to-[#f5d36b]',
    'from-[#5b8cff] to-[#8eb6ff]',
    'from-[#d4af37] to-[#5b8cff]',
    'from-[#f5d36b] to-[#d4af37]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % accents.length;
  return accents[hash];
}

export default function UserBadge({ name, compact = false }) {
  const initials = getInitials(name);
  const accent = getAccent(name);

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
      }`}
      title={name}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${accent} text-black font-display font-bold shadow-sm ${
          compact ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'
        }`}
      >
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-primary/80 leading-none">
          Member
        </span>
        <span
          className={`block font-display font-semibold text-primary truncate leading-tight ${
            compact ? 'text-xs max-w-[110px]' : 'text-sm max-w-[140px]'
          }`}
        >
          {name}
        </span>
      </span>
    </div>
  );
}
