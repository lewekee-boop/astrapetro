const body = document.body;
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const page = body.getAttribute('data-page');
if (page && nav) {
  const link = nav.querySelector(`[data-nav="${page}"]`);
  if (link) link.classList.add('is-active');
}

const revealTargets = document.querySelectorAll('.reveal');
if (revealTargets.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && body.classList.contains('nav-open')) {
    body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

const rfMapObject = document.getElementById('rf-map');
if (rfMapObject) {
  const regionNames = {
    YAN: 'ЯНАО',
    KHM: 'ХМАО',
    TYU: 'Тюменская область',
    TOM: 'Томская область',
    ORE: 'Оренбург',
    KL: 'Калмыкия'
  };

  const tooltip = document.createElement('div');
  tooltip.className = 'geo-tooltip';
  document.body.appendChild(tooltip);

  const getTooltipCoords = (event) => {
    const rect = rfMapObject.getBoundingClientRect();
    let x = event.clientX;
    let y = event.clientY;

    // In embedded SVG some browsers report coords local to the object viewport.
    if (x <= rect.width + 2 && y <= rect.height + 2) {
      x += rect.left;
      y += rect.top;
    }

    return { x, y };
  };

  const showTooltip = (text, event) => {
    tooltip.textContent = text;
    const { x, y } = getTooltipCoords(event);
    tooltip.style.left = `${x + 14}px`;
    tooltip.style.top = `${y + 14}px`;
    tooltip.classList.add('is-visible');
  };

  const moveTooltip = (event) => {
    if (!tooltip.classList.contains('is-visible')) return;
    const { x, y } = getTooltipCoords(event);
    tooltip.style.left = `${x + 14}px`;
    tooltip.style.top = `${y + 14}px`;
  };

  const hideTooltip = () => {
    tooltip.classList.remove('is-visible');
  };

  const setupMapRegions = () => {
    const svgDoc = rfMapObject.contentDocument;
    if (!svgDoc) return;

    Object.entries(regionNames).forEach(([id, name]) => {
      const regionNode = svgDoc.getElementById(id);
      if (!regionNode) return;

      regionNode.setAttribute('aria-label', name);
      if (!regionNode.querySelector('title')) {
        const title = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = name;
        regionNode.prepend(title);
      }

      regionNode.addEventListener('mouseenter', (event) => showTooltip(name, event));
      regionNode.addEventListener('mousemove', moveTooltip);
      regionNode.addEventListener('mouseleave', hideTooltip);
    });
  };

  rfMapObject.addEventListener('load', setupMapRegions);
  setupMapRegions();

  window.addEventListener('scroll', hideTooltip, { passive: true });
}
