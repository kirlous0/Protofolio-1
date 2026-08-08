import React, { useEffect, useRef, useState } from 'react';

interface BackgroundAnimationProps {
  darkMode: boolean;
  enabled?: boolean;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  darkMode,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particles setup
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1,
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const nodeColor = darkMode ? '255, 255, 255' : '51, 65, 85';
      const lineColor = darkMode ? '148, 163, 184' : '100, 116, 139';

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction boost
        const dxMouse = p.x - mousePos.x;
        const dyMouse = p.y - mousePos.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        let alpha = p.baseAlpha;

        if (distMouse < 140) {
          alpha = Math.min(0.8, p.baseAlpha + (1 - distMouse / 140) * 0.5);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, ${alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * (darkMode ? 0.15 : 0.1);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect to mouse if close
        if (distMouse < 150) {
          const mouseLineAlpha = (1 - distMouse / 150) * (darkMode ? 0.35 : 0.25);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = `rgba(${darkMode ? '59, 130, 246' : '37, 99, 235'}, ${mouseLineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [darkMode, enabled, mousePos.x, mousePos.y]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Soft Ambient Floating Glowing Orbs */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 opacity-40 animate-pulse ${
          darkMode ? 'bg-blue-600/20' : 'bg-blue-300/30'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full blur-[140px] transition-all duration-1000 opacity-30 ${
          darkMode ? 'bg-indigo-600/15' : 'bg-sky-200/40'
        }`}
      />
      <div
        className={`absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full blur-[130px] transition-all duration-1000 opacity-25 ${
          darkMode ? 'bg-emerald-600/15' : 'bg-emerald-200/30'
        }`}
      />

      {/* Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
