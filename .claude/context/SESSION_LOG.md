## ESTADO ACTUAL

Rediseño completo (fases 0–11) en rama `rediseno`, último commit `c17acf7`. Fase 12 en curso: dominio canónico `agusdev.com.ar` fijado en `config/site.ts`, README y `docs/DESPLIEGUE.md` hechos; verificación local verde. Falta que Agustín pushee `rediseno` y conecte Vercel/DNS; luego pruebas de producción, previews OG, Lighthouse prod, analítica y merge a `main` (con confirmación).

## 2026-07-23

- Se generó `.claude/context/PROJECT_MAP.md` desde cero (no existía) y este `SESSION_LOG.md` (no existía).
- Se relevó el estado del working tree: cambios sin commitear en `tecnologias.js`, `Contacto.css/jsx`, `Inicio.css/jsx`, `Proyectos.jsx`, `Tecnologias.css/jsx`; archivos nuevos sin trackear: `src/components/ContactPortal/**`, `src/components/InteractiveHeroGrid/**`, `src/sections/Tecnologias/TechnologyModal.jsx` + `.css`, `.claude/commands/`.
- No se tocó código ni se commiteó nada en esta sesión — solo documentación de contexto.
- Pendiente: decidir si commitear el trabajo en curso (ContactPortal, InteractiveHeroGrid, TechnologyModal, rediseño Tecnologias/Contacto) y con qué mensaje/alcance.

## 2026-10-26

- Fase 12 (parcial): `site.url` -> `https://agusdev.com.ar` (apex; `www` redirige en Vercel); `README.md` reescrito; nueva `docs/DESPLIEGUE.md` (Vercel, DNS Cloudflare sin proxy, www↔apex, curl de pruebas, previews, analítica, Lighthouse, merge); plan y `SEGUIMIENTO_REDISENO.md` actualizados.
- Verificado: lint, typecheck, build (18 HTML, canonical/sitemap con el dominio nuevo), i18n:check.
- Decisiones: dominio apex canónico; sin analítica por ahora (Vercel Web Analytics probablemente no exige cambio de CSP, a confirmar); Agustín hace push y alta en Vercel (no hay `gh`/`vercel` CLI ni sesión).
- Nota: `.com.ar` no se registra en Cloudflare Registrar; confirmar que los nameservers en nic.ar apunten a Cloudflare.
- PROJECT_MAP.md regenerado completo (389 archivos cambiados desde `50d35d3`; el mapa previo era del diseño legacy).
- Pendiente: push/Vercel/DNS (Agustín); pruebas prod; previews WhatsApp/LinkedIn/Facebook; Lighthouse prod; decidir analítica; merge `rediseno`->`main` con confirmación; commit `fase 12` y aprobación.
- Descartado: SSG del primer pantallazo para Perf mobile >=90 (decisión de Agustín, no pedido).
