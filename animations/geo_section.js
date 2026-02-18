(() => {
  const svgNodes = Array.from(document.querySelectorAll('[data-geo-section-svg]'));
  if (!svgNodes.length) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const applyInitialState = () => {
    const isReducedMotion = reducedMotionQuery.matches;

    svgNodes.forEach((svg) => {
      svg.classList.remove('is-scene-1', 'is-scene-2', 'is-scene-3', 'is-scene-4', 'is-resetting', 'is-no-transition');
      svg.classList.toggle('is-reduced-motion', isReducedMotion);

      const oilPackets = svg.querySelectorAll('#oil .oil-packet');
      oilPackets.forEach((packet) => {
        packet.style.opacity = '0';
      });

      const flowPath = svg.querySelector('#flow .flow-path');
      if (flowPath) {
        flowPath.style.animation = isReducedMotion ? 'none' : 'geo-flow 860ms linear infinite';
      }
    });
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', applyInitialState);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(applyInitialState);
  }

  applyInitialState();
})();
