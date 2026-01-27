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
    nodes = Array.from({ length: Math.floor(width / 160) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 1.5,
      s: 0.15 + Math.random() * 0.4,
    }));
  };

  const drawNodes = () => {
    nodes.forEach((node) => {
      node.x += node.s;
      if (node.x > width + 20) node.x = -20;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(10, 36, 86, 0.6)';
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const animate = (time) => {
    ctx.clearRect(0, 0, width, height);
    drawNodes();
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
}
