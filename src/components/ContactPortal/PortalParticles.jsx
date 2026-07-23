import { useEffect, useRef } from "react";

const COLORS = {
  green: "57, 255, 20",
  cyan: "0, 217, 255",
  violet: "168, 85, 247",
};

// Reparto de colores: mayoría verde/celeste, muy pocas violetas.
function pickColor(index, total) {
  const t = index / total;
  if (t < 0.1) return COLORS.violet;
  if (t < 0.55) return COLORS.green;
  return COLORS.cyan;
}

function createParticles(count, width, height, centerX, centerY) {
  const particles = new Array(count);
  const minR = Math.min(width, height) * 0.22;
  const maxR = Math.min(width, height) * 0.48;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = minR + Math.random() * (maxR - minR);
    const ox = centerX + Math.cos(angle) * dist;
    const oy = centerY + Math.sin(angle) * dist;

    particles[i] = {
      ox,
      oy,
      x: ox,
      y: oy,
      angle,
      dist,
      radius: 1 + Math.random() * 1.8,
      baseOpacity: 0.15 + Math.random() * 0.3,
      color: pickColor(i, count),
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.0003 + Math.random() * 0.0004,
      orbit: 0,
      swallowed: false,
      respawnAt: 0,
    };
  }
  return particles;
}

function PortalParticles({ interactionRef, isCoarsePointer, reducedMotion }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const host = wrapper.parentElement;
    const ctx = canvas.getContext("2d");

    const count = isCoarsePointer ? 12 : 28;
    const state = {
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      portalRadius: 60,
      particles: [],
      rafId: null,
      visible: true,
    };

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.width = width;
      state.height = height;
      state.centerX = width / 2;
      state.centerY = height / 2;
      state.portalRadius = Math.min(width, height) * 0.19;
      state.particles = createParticles(count, width, height, state.centerX, state.centerY);

      if (reducedMotion) drawFrame(performance.now());
    }

    function drawFrame(now) {
      ctx.clearRect(0, 0, state.width, state.height);
      const ir = interactionRef.current;
      const proximity = reducedMotion ? 0 : ir.proximity || 0;
      const open = reducedMotion ? 0 : ir.open || 0;
      const cx = state.centerX;
      const cy = state.centerY;

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];

        if (p.swallowed) {
          if (now >= p.respawnAt) {
            const angle = Math.random() * Math.PI * 2;
            const dist = state.portalRadius * 2.3 + Math.random() * state.portalRadius * 1.4;
            p.ox = cx + Math.cos(angle) * dist;
            p.oy = cy + Math.sin(angle) * dist;
            p.x = p.ox;
            p.y = p.oy;
            p.angle = angle;
            p.dist = dist;
            p.swallowed = false;
          } else {
            continue;
          }
        }

        if (!reducedMotion) {
          // Deriva ambiental suave (sin aleatoriedad por frame: fase determinística).
          p.phase += p.phaseSpeed * 16.7;
          const wanderX = Math.cos(p.phase) * 3;
          const wanderY = Math.sin(p.phase * 0.8) * 3;

          const dxToCenter = cx - p.x;
          const dyToCenter = cy - p.y;
          const distToCenter = Math.hypot(dxToCenter, dyToCenter);

          const pull = (proximity * 0.5 + open * 0.9) * 0.06;
          const targetX = p.ox + wanderX - dxToCenter * pull * -1 + (cx - p.ox) * pull;
          const targetY = p.oy + wanderY + (cy - p.oy) * pull;

          p.x += (targetX - p.x) * 0.05;
          p.y += (targetY - p.y) * 0.05;

          if (open > 0.75 && distToCenter < state.portalRadius * 0.55) {
            p.swallowed = true;
            p.respawnAt = now + 900 + Math.random() * 600;
            continue;
          }
        }

        const alpha = p.baseOpacity * (reducedMotion ? 0.6 : 1);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      drawFrame(now);
      state.rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (reducedMotion || state.rafId !== null) return;
      state.rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        state.visible = entries[0]?.isIntersecting ?? true;
        if (state.visible && !document.hidden) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(host);

    function handleVisibilityChange() {
      if (document.hidden) stopLoop();
      else if (state.visible) startLoop();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (reducedMotion) drawFrame(performance.now());
    else startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interactionRef, isCoarsePointer, reducedMotion]);

  return (
    <div className="contact-portal__particles" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PortalParticles;
