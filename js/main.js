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
    });
  };

  rfMapObject.addEventListener('load', setupMapRegions);
  setupMapRegions();
}
