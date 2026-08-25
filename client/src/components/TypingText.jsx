import { useState, useEffect } from 'react';

const PHRASES = [
  'Phone Store',
  'Phone Repair',
  'Barbershop',
  'Gaming Station',
  'Football Show Point',
  'Moneypoint',
  'Software Installation',
  'Phone & Computer Accessories',
  'Electrical Accessories',
];

export default function TypingText({
  phrases = PHRASES,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseMs = 1800,
  className = '',
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let timeout;

    if (!deleting && display === current) {
      timeout = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && display === '') {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplay((prev) =>
            deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1)
          );
        },
        deleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [display, deleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={className}>
      {display}
      <span className="typing-cursor" aria-hidden="true">|</span>
    </span>
  );
}
