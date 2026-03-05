import { useRef, useEffect } from 'react';
import { useBlockData } from '../context/BlockStreamContext.tsx';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  baseVx: number;
  baseVy: number;
}

const COLORS = ['#00e5ff', '#bf00ff', '#7c3aff'];
const PARTICLE_COUNT = 90;
const CONNECTION_DIST = 150;

function initParticles(w: number, h: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const vx = (Math.random() - 0.5) * 0.35;
    const vy = (Math.random() - 0.5) * 0.35;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx, vy,
      baseVx: vx,
      baseVy: vy,
      r: 1.2 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });
}

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef(0);
  const { isNewBlock } = useBlockData();
  const collapseRef = useRef(false);

  // Trigger collapse on new block
  useEffect(() => {
    if (isNewBlock) {
      collapseRef.current = true;
      setTimeout(() => { collapseRef.current = false; }, 1500);
    }
  }, [isNewBlock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const pts = particles.current;
      const cx = w / 2;
      const cy = h / 2;
      const collapsing = collapseRef.current;

      for (const p of pts) {
        if (collapsing) {
          // Pull particles toward center
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            p.vx += (dx / dist) * 0.8;
            p.vy += (dy / dist) * 0.8;
          }
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else {
          // Gradually return to base velocity
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = `rgba(124,58,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
