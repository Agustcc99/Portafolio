import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { site, emailUrl } from "../../config/site";
import PortalParticles from "./PortalParticles";
import "./ContactPortal.css";

// Enlaces centralizados en config/site.ts.
const WHATSAPP_URL = site.whatsapp;
const EMAIL_URL = emailUrl(
  "Contacto desde tu portafolio",
  "Hola Agustín, vi tu portafolio y quería contactarte."
);
const GITHUB_URL = site.github;

const WORDS = ["IDEA", "COLABORACIÓN", "OPORTUNIDAD", "CONSULTA", "DESARROLLO"];
// Ángulos por palabra (mismo orden que WORDS). Se evita el tramo cercano a -90°
// (arriba) para no competir nunca con el título curvado.
const WORD_ANGLES_DEG = [-150, -30, 30, 90, 150];

// Parámetros configurables: ajustar acá para modificar intensidad, radios, easing, colores, etc.
const PORTAL_CONFIG = {
  attractionRadius: 380,
  cursorSmoothing: 0.1,
  openRiseEase: 0.14,
  openFallEase: 0.05,
  proximityEase: 0.12,
  ambientBreath: 0.07,
  magneticStrength: 0.12,
  magneticMax: 10,
  magneticEase: 0.18,
  clickTransitionDuration: 480,
  tapFadeDelay: 650,
  openLabelThreshold: 0.55,
  wordPullPx: 9,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Curva de atenuación suave (smoothstep): fuerte cerca del portal, nula en el borde del radio.
function falloff(dist, radius) {
  if (dist >= radius) return 0;
  const u = 1 - dist / radius;
  return u * u * (3 - 2 * u);
}

function buildLineData(count) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const jitter = i % 3 === 0 ? 7 : i % 3 === 1 ? -5 : 2;
    const angle = ((360 / count) * i + jitter) * (Math.PI / 180);
    data.push({
      angle,
      outerR: 41 + (i % 4) * 2,
      innerR: 32 + (i % 3) * 1.5,
      baseOpacity: 0.1 + (i % 5) * 0.02,
    });
  }
  return data;
}

function buildWordData(words) {
  const radius = 45;
  return words.map((text, i) => {
    const angle = WORD_ANGLES_DEG[i % WORD_ANGLES_DEG.length] * (Math.PI / 180);
    return {
      text,
      leftPct: 50 + Math.cos(angle) * radius,
      topPct: 50 + Math.sin(angle) * radius,
      angle,
      pullFactor: 0.6 + (i % 3) * 0.15,
      tiltSign: i % 2 === 0 ? 1 : -1,
      baseOpacity: 0.22 + (i % 3) * 0.04,
    };
  });
}

function ContactPortal() {
  const isCoarsePointer = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [isClicking, setIsClicking] = useState(false);
  const [clickWave, setClickWave] = useState(0);
  const [entered, setEntered] = useState(false);

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const portalRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonTextWrapRef = useRef(null);

  const lineElementsRef = useRef([]);
  const wordElementsRef = useRef([]);

  // Un único objeto compartido (sin estado de React) leído tanto por el loop propio
  // como por PortalParticles en su loop independiente.
  const interactionRef = useRef({
    x: 0,
    y: 0,
    hasPointer: false,
    proximity: 0,
    open: 0,
  });

  const visibleWords = isCoarsePointer ? WORDS.slice(0, 3) : WORDS;
  const lineCount = isCoarsePointer ? 7 : 12;
  const lineData = useMemo(() => buildLineData(lineCount), [lineCount]);
  const wordData = useMemo(() => buildWordData(visibleWords), [visibleWords]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const portalEl = portalRef.current;
    const button = buttonRef.current;
    const ir = interactionRef.current;

    const geometry = { centerX: 0, centerY: 0, portalRadius: 60 };
    const smoothed = { x: 0, y: 0 };
    const openState = { value: 0 };
    const proximityState = { value: 0 };
    const magnetic = { x: 0, y: 0 };
    let wasOpenLabel = false;
    let rafId = null;
    let visible = true;
    let tapFadeTimeout = null;

    function measure() {
      const stageRect = stage.getBoundingClientRect();
      const portalRect = portalEl.getBoundingClientRect();
      geometry.centerX = portalRect.left - stageRect.left + portalRect.width / 2;
      geometry.centerY = portalRect.top - stageRect.top + portalRect.height / 2;
      geometry.portalRadius = portalRect.width / 2;
      if (!ir.hasPointer) {
        smoothed.x = geometry.centerX;
        smoothed.y = geometry.centerY;
      }
    }

    function handlePointerMove(evento) {
      const rect = stage.getBoundingClientRect();
      ir.x = evento.clientX - rect.left;
      ir.y = evento.clientY - rect.top;
      ir.hasPointer = true;
    }

    function handlePointerLeave() {
      ir.hasPointer = false;
    }

    function handleTap(evento) {
      const rect = stage.getBoundingClientRect();
      ir.x = evento.clientX - rect.left;
      ir.y = evento.clientY - rect.top;
      ir.hasPointer = true;
      if (tapFadeTimeout) window.clearTimeout(tapFadeTimeout);
      tapFadeTimeout = window.setTimeout(() => {
        ir.hasPointer = false;
      }, PORTAL_CONFIG.tapFadeDelay);
    }

    if (!reducedMotion) {
      if (isCoarsePointer) {
        stage.addEventListener("pointerdown", handleTap);
      } else {
        stage.addEventListener("pointermove", handlePointerMove);
        stage.addEventListener("pointerleave", handlePointerLeave);
      }
    }

    function tick(now) {
      // Objetivo del cursor: posición real si hay puntero activo, si no el centro (reposo).
      const idle = !ir.hasPointer;
      const targetX = idle ? geometry.centerX : ir.x;
      const targetY = idle ? geometry.centerY : ir.y;

      smoothed.x += (targetX - smoothed.x) * PORTAL_CONFIG.cursorSmoothing;
      smoothed.y += (targetY - smoothed.y) * PORTAL_CONFIG.cursorSmoothing;

      const dx = smoothed.x - geometry.centerX;
      const dy = smoothed.y - geometry.centerY;
      const dist = Math.hypot(dx, dy);

      const rawProximity = idle ? 0 : falloff(dist, PORTAL_CONFIG.attractionRadius);
      const isOver = !idle && dist <= geometry.portalRadius * 1.1;

      // Respiración ambiental: mantiene el portal "vivo" incluso sin interacción.
      const ambient = PORTAL_CONFIG.ambientBreath + Math.sin(now * 0.0007) * PORTAL_CONFIG.ambientBreath * 0.5;
      const openTarget = isOver ? 1 : Math.max(rawProximity * 0.4, ambient * 0.3);
      const proximityTarget = Math.max(rawProximity, ambient);

      const openEase = openTarget > openState.value ? PORTAL_CONFIG.openRiseEase : PORTAL_CONFIG.openFallEase;
      openState.value += (openTarget - openState.value) * openEase;
      proximityState.value += (proximityTarget - proximityState.value) * PORTAL_CONFIG.proximityEase;

      ir.proximity = proximityState.value;
      ir.open = openState.value;

      root.style.setProperty("--cp-open", openState.value.toFixed(3));
      root.style.setProperty("--cp-proximity", proximityState.value.toFixed(3));

      const shouldShowOpenLabel = openState.value > PORTAL_CONFIG.openLabelThreshold;
      if (shouldShowOpenLabel !== wasOpenLabel) {
        wasOpenLabel = shouldShowOpenLabel;
        if (button) button.dataset.state = shouldShowOpenLabel ? "open" : "idle";
      }

      if (button) {
        const targetBx = isOver ? clamp(dx * PORTAL_CONFIG.magneticStrength, -PORTAL_CONFIG.magneticMax, PORTAL_CONFIG.magneticMax) : 0;
        const targetBy = isOver ? clamp(dy * PORTAL_CONFIG.magneticStrength, -PORTAL_CONFIG.magneticMax, PORTAL_CONFIG.magneticMax) : 0;
        magnetic.x += (targetBx - magnetic.x) * PORTAL_CONFIG.magneticEase;
        magnetic.y += (targetBy - magnetic.y) * PORTAL_CONFIG.magneticEase;
        button.style.transform = `translate(${magnetic.x.toFixed(2)}px, ${magnetic.y.toFixed(2)}px)`;
        if (buttonTextWrapRef.current) {
          buttonTextWrapRef.current.style.transform = `translate(${(magnetic.x * 0.4).toFixed(2)}px, ${(magnetic.y * 0.4).toFixed(2)}px)`;
        }
      }

      const lines = lineElementsRef.current;
      const converge = proximityState.value * 0.5 + openState.value * 0.35;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const base = lineData[i];
        if (!line || !base) continue;
        const innerR = base.innerR - converge * 13;
        const outerR = base.outerR + converge * 5;
        line.setAttribute("x1", (50 + Math.cos(base.angle) * outerR).toFixed(2));
        line.setAttribute("y1", (50 + Math.sin(base.angle) * outerR).toFixed(2));
        line.setAttribute("x2", (50 + Math.cos(base.angle) * innerR).toFixed(2));
        line.setAttribute("y2", (50 + Math.sin(base.angle) * innerR).toFixed(2));
        line.style.opacity = (base.baseOpacity + converge * 0.5).toFixed(2);
      }

      const words = wordElementsRef.current;
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const base = wordData[i];
        if (!word || !base) continue;
        // Reacción leve: desplazamiento acotado (~8-12px máx), muy por debajo de partículas/líneas.
        const pull = Math.min(proximityState.value * base.pullFactor * (0.5 + openState.value * 0.7), 1);
        const wx = -Math.cos(base.angle) * pull * PORTAL_CONFIG.wordPullPx;
        const wy = -Math.sin(base.angle) * pull * PORTAL_CONFIG.wordPullPx;
        const tilt = pull * base.tiltSign * 4;
        word.style.transform = `translate(calc(-50% + ${wx.toFixed(2)}px), calc(-50% + ${wy.toFixed(2)}px)) rotate(${tilt.toFixed(2)}deg)`;
        word.style.opacity = (base.baseOpacity * (1 - pull * 0.3)).toFixed(2);
      }

      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (reducedMotion || rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);
    measure();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible = entry?.isIntersecting ?? true;
        if (visible) {
          setEntered(true);
          if (!document.hidden) startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.2 }
    );
    intersectionObserver.observe(root);

    // Salvaguarda: si por algún motivo el observer no llega a disparar, el contenido
    // (botón incluido) no debe quedar oculto indefinidamente detrás de la animación de entrada.
    const enteredFallback = window.setTimeout(() => setEntered(true), 2500);

    function handleVisibilityChange() {
      if (document.hidden) stopLoop();
      else if (visible) startLoop();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    function handleReducedMotionChange(evento) {
      setReducedMotion(evento.matches);
    }
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    if (reducedMotion) {
      root.style.setProperty("--cp-open", "0.12");
      root.style.setProperty("--cp-proximity", "0.12");
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.clearTimeout(enteredFallback);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      if (tapFadeTimeout) window.clearTimeout(tapFadeTimeout);
      stage.removeEventListener("pointerdown", handleTap);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isCoarsePointer, reducedMotion, lineData, wordData]);

  function handlePortalClick() {
    // No se llama preventDefault: el <a target="_blank"> navega de forma nativa y sincrónica
    // dentro del mismo gesto de clic, así la apertura de WhatsApp nunca depende de un
    // window.open demorado (lo que suelen bloquear los navegadores). La animación de
    // transición corre en esta pestaña mientras WhatsApp se abre en la nueva.
    setIsClicking(true);
    setClickWave((n) => n + 1);
    window.setTimeout(() => setIsClicking(false), PORTAL_CONFIG.clickTransitionDuration);
  }

  return (
    <div
      className={`contact-portal${entered ? " contact-portal--entered" : ""}${isClicking ? " contact-portal--clicking" : ""}`}
      ref={rootRef}
    >
      <div className="contact-portal__field" aria-hidden="true" />

      <div className="contact-portal__stage" ref={stageRef}>
        <svg className="contact-portal__lines" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          {lineData.map((base, i) => (
            <line
              key={i}
              ref={(el) => {
                lineElementsRef.current[i] = el;
                return () => {
                  lineElementsRef.current[i] = null;
                };
              }}
              x1={50 + Math.cos(base.angle) * base.outerR}
              y1={50 + Math.sin(base.angle) * base.outerR}
              x2={50 + Math.cos(base.angle) * base.innerR}
              y2={50 + Math.sin(base.angle) * base.innerR}
              style={{ opacity: base.baseOpacity }}
            />
          ))}
        </svg>

        <div className="contact-portal__words" aria-hidden="true">
          {wordData.map((word, i) => (
            <span
              key={word.text}
              ref={(el) => {
                wordElementsRef.current[i] = el;
                return () => {
                  wordElementsRef.current[i] = null;
                };
              }}
              className="contact-portal__word"
              style={{ left: `${word.leftPct}%`, top: `${word.topPct}%`, opacity: word.baseOpacity }}
            >
              {word.text}
            </span>
          ))}
        </div>

        <PortalParticles
          interactionRef={interactionRef}
          isCoarsePointer={isCoarsePointer}
          reducedMotion={reducedMotion}
        />

        <div className="contact-portal__portal" ref={portalRef}>
          <div className="contact-portal__halo" />
          <div className="contact-portal__ring contact-portal__ring--outer" />
          <div className="contact-portal__ring contact-portal__ring--inner" />
          <div className="contact-portal__wave" key={clickWave} />

          <div className="contact-portal__core">
            <a
              ref={buttonRef}
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="contact-portal__button"
              data-state="idle"
              onClick={handlePortalClick}
              aria-label="Iniciar conversación por WhatsApp con Agustín Tacconi"
            >
              <span className="contact-portal__button-label" ref={buttonTextWrapRef}>
                <span className="contact-portal__button-text contact-portal__button-text--idle">
                  Iniciar conversación
                </span>
                <span className="contact-portal__button-text contact-portal__button-text--open">
                  Abrir WhatsApp
                </span>
                <span className="contact-portal__button-text contact-portal__button-text--clicking">
                  Abriendo conversación…
                </span>
              </span>
              <MessageCircle className="contact-portal__button-icon" size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <p className="contact-portal__support">
        Estoy abierto a oportunidades, proyectos y colaboraciones donde pueda seguir creciendo.
      </p>

      <ul className="contact-portal__links">
        <li>
          <a href={EMAIL_URL} aria-label="Enviar un email a Agustín Tacconi">
            Email <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </li>
        <li>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver el perfil de GitHub de Agustín Tacconi (se abre en una pestaña nueva)"
          >
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  );
}

export default ContactPortal;
