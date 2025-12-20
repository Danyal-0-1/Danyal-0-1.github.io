export function initNav() {
  const links = Array.from(document.querySelectorAll('.nav a')) as HTMLAnchorElement[];
  const sections = links
    .map(link => ({ link, target: document.querySelector(link.getAttribute('href') || '') }))
    .filter(item => item.target) as { link: HTMLAnchorElement; target: Element }[];

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const item = sections.find(section => section.target === entry.target);
        if (!item) return;
        if (entry.isIntersecting) {
          links.forEach(link => link.removeAttribute('aria-current'));
          item.link.setAttribute('aria-current', 'page');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(item => observer.observe(item.target));
}
