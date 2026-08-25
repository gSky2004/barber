export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function handleNavClick(e, sectionId, navigate, pathname) {
  e.preventDefault();
  if (pathname === '/') {
    scrollToSection(sectionId);
    window.history.pushState(null, '', `/#${sectionId}`);
  } else {
    navigate(`/#${sectionId}`);
  }
}
