const canvas = document.getElementById('hud');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let nodes = [];

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    nodes = Array.from({ length: Math.floor(width / 120) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2,
      s: 0.2 + Math.random() * 0.6,
    }));
  };

  const drawRings = (time) => {
    const cx = width * 0.72;
    const cy = height * 0.32;
    const base = Math.min(width, height) * 0.08;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(99, 164, 255, ${0.25 - i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, base + i * 26 + Math.sin(time / 1800 + i) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawNodes = () => {
    nodes.forEach((node) => {
      node.x += node.s;
      if (node.x > width + 20) node.x = -20;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(127, 212, 255, 0.4)';
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawGridPulse = (time) => {
    const pulse = (Math.sin(time / 1400) + 1) / 2;
    ctx.strokeStyle = `rgba(63, 124, 255, ${0.08 + pulse * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.76);
    ctx.lineTo(width * 0.36, height * 0.76);
    ctx.lineTo(width * 0.46, height * 0.64);
    ctx.lineTo(width * 0.58, height * 0.64);
    ctx.stroke();
  };

  const animate = (time) => {
    ctx.clearRect(0, 0, width, height);
    drawNodes();
    drawRings(time);
    drawGridPulse(time);
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
}
