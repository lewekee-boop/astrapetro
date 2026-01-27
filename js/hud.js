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

  const drawBlueprintLines = (time) => {
    const offset = (time / 80) % 80;
    ctx.strokeStyle = 'rgba(31, 95, 191, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -80; x < width + 80; x += 120) {
      ctx.moveTo(x + offset, height * 0.2);
      ctx.lineTo(x + offset + 80, height * 0.55);
    }
    ctx.stroke();
  };

  const drawNodes = () => {
    nodes.forEach((node) => {
      node.x += node.s;
      if (node.x > width + 20) node.x = -20;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(43, 108, 201, 0.26)';
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawChartLine = (time) => {
    ctx.strokeStyle = 'rgba(31, 95, 191, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const baseY = height * 0.78;
    ctx.moveTo(width * 0.08, baseY);
    ctx.lineTo(width * 0.22, baseY - 18);
    ctx.lineTo(width * 0.35, baseY - 10 - Math.sin(time / 1200) * 8);
    ctx.lineTo(width * 0.5, baseY - 26);
    ctx.lineTo(width * 0.62, baseY - 12);
    ctx.stroke();
  };

  const animate = (time) => {
    ctx.clearRect(0, 0, width, height);
    drawNodes();
    drawBlueprintLines(time);
    drawChartLine(time);
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
}
