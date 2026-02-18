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
  const regionIds = new Set(Object.keys(regionNames));
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

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

  const showTooltipNearMap = (text) => {
    tooltip.textContent = text;
    const rect = rfMapObject.getBoundingClientRect();
    tooltip.style.left = `${rect.left + 16}px`;
    tooltip.style.top = `${rect.top + 16}px`;
    tooltip.classList.add('is-visible');
  };

  const setupMapRegions = () => {
    const svgDoc = rfMapObject.contentDocument;
    if (!svgDoc) return;

    const subjectsGroup = svgDoc.getElementById('Subjects_Outline');
    const regionNodes = subjectsGroup ? Array.from(subjectsGroup.querySelectorAll('[id]')) : [];

    regionNodes.forEach((regionNode) => {
      const id = regionNode.id;
      const isPresenceRegion = regionIds.has(id);
      regionNode.setAttribute('data-region', id);
      regionNode.style.pointerEvents = isPresenceRegion ? 'auto' : 'none';
      regionNode.style.cursor = isPresenceRegion ? 'default' : 'auto';

      if (!isPresenceRegion) return;

      const name = regionNames[id];
      regionNode.setAttribute('aria-label', name);
      const nativeTitle = regionNode.querySelector('title');
      if (nativeTitle) nativeTitle.remove();

      regionNode.addEventListener('mouseenter', (event) => showTooltip(name, event));
      regionNode.addEventListener('mousemove', moveTooltip);
      regionNode.addEventListener('mouseleave', hideTooltip);
      regionNode.addEventListener('touchstart', (event) => {
        event.preventDefault();
        showTooltipNearMap(name);
      }, { passive: false });
    });

    if (coarsePointer) {
      svgDoc.addEventListener('touchstart', (event) => {
        const region = event.target?.closest?.('[id]');
        if (!region || !regionIds.has(region.id)) {
          hideTooltip();
        }
      }, { passive: true });
    }
  };

  rfMapObject.addEventListener('load', setupMapRegions);
  setupMapRegions();

  document.addEventListener('touchstart', (event) => {
    if (rfMapObject.contains(event.target)) return;
    hideTooltip();
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    if (rfMapObject.contains(event.target)) return;
    hideTooltip();
  }, { passive: true });

  window.addEventListener('scroll', hideTooltip, { passive: true });
}
