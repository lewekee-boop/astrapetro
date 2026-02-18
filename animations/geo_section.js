(() => {
  const svgNodes = Array.from(document.querySelectorAll('[data-geo-section-svg]'));
  if (!svgNodes.length) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controllers = svgNodes.map((svg) => createGeoSectionController(svg));

  const syncMotionPreference = () => {
    if (reducedMotionQuery.matches) {
      controllers.forEach((controller) => controller.showStatic());
      return;
    }

    controllers.forEach((controller) => controller.start());
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', syncMotionPreference);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(syncMotionPreference);
  }

  syncMotionPreference();
})();

function createGeoSectionController(svg) {
  const strataPaths = Array.from(svg.querySelectorAll('#strata .strata-line'));
  const reservoirBands = Array.from(svg.querySelectorAll('#strata .reservoir-band'));
  const wellPath = svg.querySelector('#well-path');
  const oilRoute = svg.querySelector('#oil-route');
  const oilPackets = Array.from(svg.querySelectorAll('#oil .oil-packet'));

  strataPaths.forEach((path) => setPathLength(path, '--path-length'));
  reservoirBands.forEach((path) => setPathLength(path, '--path-length'));
  if (wellPath) setPathLength(wellPath, '--well-length');

  let oilRouteLength = 0;
  if (oilRoute) {
    try {
      oilRouteLength = oilRoute.getTotalLength();
    } catch (error) {
      oilRouteLength = 0;
    }
  }

  const stateClasses = ['is-scene-1', 'is-scene-2', 'is-scene-3', 'is-scene-4', 'is-resetting'];
  const timers = new Set();
  let rafId = 0;
  let running = false;

  const sceneTimeline = {
    scene1: 2300,
    scene2: 4700,
    scene3: 7700,
    scene4: 10100,
    reset: 10950
  };

  const schedule = (fn, delay) => {
    const timerId = window.setTimeout(() => {
      timers.delete(timerId);
      fn();
    }, delay);

    timers.add(timerId);
  };

  const clearTimers = () => {
    timers.forEach((timerId) => window.clearTimeout(timerId));
    timers.clear();
  };

  const resetPackets = () => {
    if (!oilPackets.length || !oilRoute || !oilRouteLength) return;

    const startPoint = oilRoute.getPointAtLength(0);
    oilPackets.forEach((packet) => {
      packet.setAttribute('cx', startPoint.x.toFixed(2));
      packet.setAttribute('cy', startPoint.y.toFixed(2));
      packet.style.opacity = '0';
    });
  };

  const stopPacketAnimation = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    oilPackets.forEach((packet) => {
      packet.style.opacity = '0';
    });
  };

  const animateOilPackets = (duration) => {
    if (!oilRoute || !oilPackets.length || !oilRouteLength) return;

    stopPacketAnimation();

    const startAt = performance.now();
    const spacing = 0.18;

    const frame = (now) => {
      const progress = Math.min(1, (now - startAt) / duration);

      oilPackets.forEach((packet, index) => {
        const shifted = Math.max(0, Math.min(1, (progress - index * spacing) / (1 - index * spacing)));
        const eased = easeInOut(shifted);
        const point = oilRoute.getPointAtLength(oilRouteLength * eased);

        packet.setAttribute('cx', point.x.toFixed(2));
        packet.setAttribute('cy', point.y.toFixed(2));
        packet.style.opacity = shifted > 0 && shifted < 1 ? '0.95' : '0';
      });

      if (progress < 1 && running) {
        rafId = window.requestAnimationFrame(frame);
        return;
      }

      stopPacketAnimation();
    };

    rafId = window.requestAnimationFrame(frame);
  };

  const hardReset = () => {
    svg.classList.add('is-no-transition');
    svg.classList.remove(...stateClasses);
    resetPackets();
    void svg.getBoundingClientRect();
    svg.classList.remove('is-no-transition');
  };

  const runLoop = () => {
    if (!running) return;

    hardReset();
    schedule(() => svg.classList.add('is-scene-1'), 40);
    schedule(() => svg.classList.add('is-scene-2'), sceneTimeline.scene1);
    schedule(() => {
      svg.classList.add('is-scene-3');
      // Let the trap fill appear first, then drive inflow to the well.
      schedule(() => animateOilPackets(1900), 520);
    }, sceneTimeline.scene2);
    schedule(() => svg.classList.add('is-scene-4'), sceneTimeline.scene3);
    schedule(() => svg.classList.add('is-resetting'), sceneTimeline.scene4);
    schedule(() => runLoop(), sceneTimeline.reset);
  };

  const stop = () => {
    running = false;
    clearTimers();
    stopPacketAnimation();
  };

  const start = () => {
    stop();
    running = true;
    runLoop();
  };

  const showStatic = () => {
    stop();
    svg.classList.add('is-no-transition');
    svg.classList.remove(...stateClasses);
    svg.classList.add('is-scene-1', 'is-scene-2', 'is-scene-3', 'is-scene-4');
    resetPackets();
    void svg.getBoundingClientRect();
    svg.classList.remove('is-no-transition');
  };

  resetPackets();

  return {
    start,
    showStatic
  };
}

function setPathLength(path, variableName) {
  try {
    const length = path.getTotalLength();
    path.style.setProperty(variableName, length.toFixed(2));
  } catch (error) {
    path.style.setProperty(variableName, '1');
  }
}

function easeInOut(value) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;
}
