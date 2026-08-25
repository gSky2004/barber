const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    themeToggle.textContent = nextTheme === 'dark' ? '☀︎' : '☾';
  });
}

const typingText = document.getElementById('typingText');
const slogans = ['fast repairs', 'sharp style', 'premium care', 'gaming comfort'];
let sloganIndex = 0;
let charIndex = 0;

function typeSlogan() {
  if (!typingText) return;
  if (charIndex < slogans[sloganIndex].length) {
    typingText.textContent = slogans[sloganIndex].slice(0, charIndex + 1);
    charIndex += 1;
    setTimeout(typeSlogan, 90);
  } else {
    setTimeout(() => {
      typingText.textContent = '';
      charIndex = 0;
      sloganIndex = (sloganIndex + 1) % slogans.length;
      typeSlogan();
    }, 1200);
  }
}

typeSlogan();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const countTo = Number(target.getAttribute('data-count'));
      let current = 0;
      const step = Math.max(1, Math.ceil(countTo / 60));
      const interval = setInterval(() => {
        current += step;
        if (current >= countTo) {
          target.textContent = `${countTo}+`;
          clearInterval(interval);
          counterObserver.unobserve(target);
        } else {
          target.textContent = `${current}+`;
        }
      }, 20);
    });
  },
  { threshold: 0.7 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const faqItems = document.querySelectorAll('.faq-list details');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((entry) => {
        if (entry !== item) entry.open = false;
      });
    }
  });
});
