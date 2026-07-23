import { useEffect, useRef } from "react";
import "./InteractiveHeroGrid.css";

// Parámetros configurables: ajustar acá para modificar intensidad, radio, colores, etc.
const CONFIG = {
  gridSpacingDesktop: 46,
  gridSpacingMobile: 58,

  interactionRadius: 190,
  maxDisplacement: 20,
  waveStrength: 5,
  waveSpeed: 0.006,
  wavePulsePeriod: 1900,

  cursorSmoothingFast: 0.12,
  cursorSmoothingSlow: 0.05,
  restoreStrength: 0.07,
  idleFadeMs: 260,

  gridOpacity: 0.05,
  highlightOpacity: 0.34,

  primaryLightColor: "57, 255, 20",
  secondaryLightColor: "168, 85, 247",
  primaryLightRadius: 360,
  secondaryLightRadius: 300,
  primaryLightAlpha: 0.16,
  secondaryLightAlpha: 0.12,

  mobileWaveAmplitude: 5,
  mobileWaveSpeed: 0.0009,

  maxDevicePixelRatio: 2,
};

// Curva de atenuación suave (smoothstep) para que el límite del radio no se note.
function falloff(dist, radius) {
  if (dist >= radius) return 0;
  const u = 1 - dist / radius;
  return u * u * (3 - 2 * u);
}

function drawLight(ctx, x, y, radius, rgb, alpha) {
  if (alpha <= 0.001) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function applyCursorForces(points, cx, cy, intensity, speed, now) {
  const radius = CONFIG.interactionRadius;
  const speedBoost = 1 + Math.min(speed * 6, 0.6);

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dx = p.ox - cx;
    const dy = p.oy - cy;
    const dist = Math.hypot(dx, dy);

    if (intensity > 0.001 && dist < radius * 1.3) {
      const f = falloff(dist, radius);
      const angle = Math.atan2(dy, dx);
      const wave = Math.sin(dist * 0.045 - now * CONFIG.waveSpeed) * CONFIG.waveStrength;
      const push = (f * CONFIG.maxDisplacement * speedBoost + wave * f) * intensity;
      const targetX = p.ox + Math.cos(angle) * push;
      const targetY = p.oy + Math.sin(angle) * push;
      p.x += (targetX - p.x) * 0.2;
      p.y += (targetY - p.y) * 0.2;
      p.near = f * intensity;
    } else {
      p.x += (p.ox - p.x) * CONFIG.restoreStrength;
      p.y += (p.oy - p.y) * CONFIG.restoreStrength;
      p.near = 0;
    }
  }
}

function applyAmbientWave(points, now) {
  const scrollFactor = (window.scrollY || 0) * 0.0015;
  const phase = now * CONFIG.mobileWaveSpeed + scrollFactor;
  const amp = CONFIG.mobileWaveAmplitude;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const localPhase = phase + p.ox * 0.01 + p.oy * 0.01;
    const targetX = p.ox + Math.cos(localPhase) * amp * 0.4;
    const targetY = p.oy + Math.sin(localPhase) * amp;
    p.x += (targetX - p.x) * 0.05;
    p.y += (targetY - p.y) * 0.05;
  }
}

function buildGrid(width, height, spacing) {
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;
  const points = new Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = c * spacing;
      const oy = r * spacing;
      points[r * cols + c] = { ox, oy, x: ox, y: oy, near: 0 };
    }
  }

  return { points, cols, rows };
}

function drawFrame(ctx, width, height, grid, fast, slow, intensity) {
  ctx.clearRect(0, 0, width, height);

  // Luces reactivas: se mezclan aditivamente detrás de la cuadrícula.
  ctx.globalCompositeOperation = "lighter";
  drawLight(
    ctx,
    fast.x,
    fast.y,
    CONFIG.primaryLightRadius,
    CONFIG.primaryLightColor,
    CONFIG.primaryLightAlpha * (0.4 + intensity * 0.6)
  );
  drawLight(
    ctx,
    slow.x,
    slow.y,
    CONFIG.secondaryLightRadius,
    CONFIG.secondaryLightColor,
    CONFIG.secondaryLightAlpha * (0.4 + intensity * 0.6)
  );
  ctx.globalCompositeOperation = "source-over";

  const { points, cols, rows } = grid;

  // Cuadrícula base en un único trazo (barato incluso con varios cientos de puntos).
  ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.gridOpacity})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = points[r * cols + c];
      if (c === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const p = points[r * cols + c];
      if (r === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  if (intensity <= 0.02) return;

  // Resalte local: solo se recorren los puntos cercanos al cursor (p.near > 0).
  ctx.lineWidth = 1.3;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.near <= 0.03) continue;

    ctx.strokeStyle = `rgba(${CONFIG.primaryLightColor}, ${p.near * CONFIG.highlightOpacity})`;
    const col = i % cols;

    if (col < cols - 1) {
      const right = points[i + 1];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }

    const down = points[i + cols];
    if (down) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(down.x, down.y);
      ctx.stroke();
    }
  }

  // Onda circular sutil que se propaga desde el cursor.
  const pulseT = (performance.now() % CONFIG.wavePulsePeriod) / CONFIG.wavePulsePeriod;
  ctx.strokeStyle = `rgba(${CONFIG.primaryLightColor}, ${(1 - pulseT) * 0.16 * intensity})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(fast.x, fast.y, pulseT * CONFIG.interactionRadius * 1.25, 0, Math.PI * 2);
  ctx.stroke();
}

function InteractiveHeroGrid() {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const host = wrapper.parentElement;
    const ctx = canvas.getContext("2d");

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;

    const state = {
      width: 0,
      height: 0,
      grid: { points: [], cols: 0, rows: 0 },
      fast: { x: 0, y: 0 },
      slow: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      lastRaw: { x: 0, y: 0, t: 0 },
      speed: 0,
      intensity: 0,
      hasPointer: false,
      lastMove: 0,
      visible: true,
      rafId: null,
    };

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);

      // Escalado por devicePixelRatio: el canvas interno crece con el dpr,
      // pero el contexto se reescala para seguir dibujando en coordenadas CSS.
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.width = width;
      state.height = height;
      const spacing = isCoarsePointer ? CONFIG.gridSpacingMobile : CONFIG.gridSpacingDesktop;
      state.grid = buildGrid(width, height, spacing);

      state.fast.x = width / 2;
      state.fast.y = height * 0.42;
      state.slow.x = width / 2;
      state.slow.y = height * 0.42;
      state.target.x = width / 2;
      state.target.y = height * 0.42;

      if (reducedMotion) drawStaticFrame();
    }

    function drawStaticFrame() {
      const { width, height, grid } = state;
      const fast = { x: width * 0.2, y: height * 0.2 };
      const slow = { x: width * 0.8, y: height * 0.3 };
      drawFrame(ctx, width, height, grid, fast, slow, 0.35);
    }

    function updatePointerMeta(x, y) {
      const now = performance.now();
      const dt = Math.max(now - state.lastRaw.t, 1);
      const dx = x - state.lastRaw.x;
      const dy = y - state.lastRaw.y;
      const instSpeed = Math.hypot(dx, dy) / dt;
      state.speed = state.speed * 0.5 + instSpeed * 0.5;
      state.lastRaw.x = x;
      state.lastRaw.y = y;
      state.lastRaw.t = now;
      state.target.x = x;
      state.target.y = y;
      state.lastMove = now;
      state.hasPointer = true;
    }

    function handlePointerMove(evento) {
      if (isCoarsePointer) return;
      const rect = host.getBoundingClientRect();
      updatePointerMeta(evento.clientX - rect.left, evento.clientY - rect.top);
    }

    function handlePointerLeave() {
      state.hasPointer = false;
      state.lastMove = performance.now() - CONFIG.idleFadeMs;
      // Al salir, la iluminación vuelve a una posición ambiental neutra.
      state.target.x = state.width / 2;
      state.target.y = state.height * 0.42;
    }

    function handleTouchMove(evento) {
      const touch = evento.touches[0];
      if (!touch) return;
      const rect = host.getBoundingClientRect();
      updatePointerMeta(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    function handleTouchEnd() {
      state.hasPointer = false;
    }

    if (!reducedMotion) {
      if (isCoarsePointer) {
        host.addEventListener("touchstart", handleTouchMove, { passive: true });
        host.addEventListener("touchmove", handleTouchMove, { passive: true });
        host.addEventListener("touchend", handleTouchEnd, { passive: true });
        host.addEventListener("touchcancel", handleTouchEnd, { passive: true });
      } else {
        host.addEventListener("pointermove", handlePointerMove);
        host.addEventListener("pointerleave", handlePointerLeave);
      }
    }

    function tick() {
      const now = performance.now();

      // Interpolación del cursor: la luz "rápida" y la "lenta" persiguen el objetivo con distinto retraso.
      state.fast.x += (state.target.x - state.fast.x) * CONFIG.cursorSmoothingFast;
      state.fast.y += (state.target.y - state.fast.y) * CONFIG.cursorSmoothingFast;
      state.slow.x += (state.target.x - state.slow.x) * CONFIG.cursorSmoothingSlow;
      state.slow.y += (state.target.y - state.slow.y) * CONFIG.cursorSmoothingSlow;

      const idle = now - state.lastMove > CONFIG.idleFadeMs;
      const intensityTarget = state.hasPointer && !idle ? 1 : 0;
      const ease = intensityTarget > state.intensity ? 0.15 : 0.03;
      state.intensity += (intensityTarget - state.intensity) * ease;
      state.speed *= 0.9;

      if (isCoarsePointer) {
        applyAmbientWave(state.grid.points, now);
        if (state.hasPointer) {
          applyCursorForces(state.grid.points, state.target.x, state.target.y, 0.7, state.speed, now);
        }
      } else {
        applyCursorForces(state.grid.points, state.fast.x, state.fast.y, state.intensity, state.speed, now);
      }

      drawFrame(ctx, state.width, state.height, state.grid, state.fast, state.slow, state.intensity);
      state.rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (reducedMotion || state.rafId !== null) return;
      state.lastRaw.t = performance.now();
      state.rafId = requestAnimationFrame(tick);
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

    function handleReducedMotionChange(evento) {
      reducedMotion = evento.matches;
      if (reducedMotion) {
        stopLoop();
        drawStaticFrame();
      } else {
        startLoop();
      }
    }
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    if (reducedMotion) drawStaticFrame();
    else startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
      host.removeEventListener("touchstart", handleTouchMove);
      host.removeEventListener("touchmove", handleTouchMove);
      host.removeEventListener("touchend", handleTouchEnd);
      host.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  return (
    <div className="interactive-hero-grid" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default InteractiveHeroGrid;
