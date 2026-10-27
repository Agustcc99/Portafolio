# Despliegue en Vercel + dominio (`agusdev.com.ar`)

Guía de la Fase 12. Lo que depende de cuentas (GitHub, Vercel, DNS) lo hace Agustín; el resto está verificado en local.

## 1. Subir el repo y conectar Vercel

```bash
git push -u origin rediseno      # no toca main
```

1. Vercel → **Add New… → Project** → importar `Agustcc99/Portafolio`.
2. **Framework Preset:** Vite. Ya lo fijan `vercel.json` (`framework`, `buildCommand: npm run build`, `outputDirectory: dist`); no hace falta cambiar nada.
3. **Node.js Version:** 22.x o 24.x (Settings → General). El prerender necesita ≥ 22.22 (`engines` en `package.json`).
4. Production Branch: `main` (Settings → Git). Mientras `rediseno` no se mergee, cada push a esa rama genera un **Preview** en `*.vercel.app`.
5. *(Solo si querés que el Preview tenga URLs/canonical propios)* Settings → Environment Variables → `SITE_URL` con la URL del preview, scope **Preview**. No la definas en Production: allí manda `site.url`.

> El build del Preview con el dominio real en el canonical es normal; `SITE_URL` solo evita que las previews apunten a `agusdev.com.ar` mientras el dominio no esté conectado.

## 2. Dominio canónico

- Canónico: **apex** `https://agusdev.com.ar` (`src/config/site.ts` → `site.url`). Lo usan canonical, `hreflang`, sitemap, `robots.txt`, OG y JSON-LD.
- `www.agusdev.com.ar` redirige al apex (paso 3).
- Para otra URL de prueba sin tocar el código: `SITE_URL=https://xxx.vercel.app npm run build`.

## 3. Dominio propio y DNS

En Vercel: Project → **Settings → Domains → Add**:

1. Agregar `agusdev.com.ar` (apex) y `www.agusdev.com.ar`.
2. En `www`, elegir **Redirect to** `agusdev.com.ar` (308). El apex queda como dominio principal.
3. Vercel muestra los registros exactos a crear; usar **esos valores**. Los habituales:

| Tipo | Nombre | Valor |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

**DNS en Cloudflare:** crear ambos registros en modo **DNS only** (nube gris). Con el proxy naranja Vercel no puede emitir el certificado ni verificar el dominio y se pisan las cabeceras de `vercel.json`.

**Ojo con el registrador:** Cloudflare Registrar no vende dominios `.ar`. Un `.com.ar` se registra en NIC Argentina (nic.ar); lo habitual es que Cloudflare solo aloje la zona DNS. Si el DNS "no responde", verificá en nic.ar que el dominio tenga como servidores de nombres los dos de Cloudflare (los de tu panel → DNS → Cloudflare nameservers) y esperá la propagación (minutos a horas).

HTTPS: Vercel emite el certificado solo cuando el DNS resuelve; el estado "Valid Configuration" en Domains lo confirma. `vercel.json` ya envía HSTS.

## 4. Pruebas en producción

Reemplazá `HOST` por `https://agusdev.com.ar` (o la URL del preview).

```bash
# Redirect de / : cookie > Accept-Language > inglés
curl -sI -H "Accept-Language: es-AR,es;q=0.9" HOST/ | grep -i -E "^HTTP|^location"   # 307 -> /es
curl -sI -H "Accept-Language: en-US,en;q=0.9" HOST/ | grep -i -E "^HTTP|^location"   # 307 -> /en
curl -sI -H "Cookie: lang=en" -H "Accept-Language: es" HOST/ | grep -i -E "^HTTP|^location"   # 307 -> /en (gana la cookie)

# www -> apex
curl -sI https://www.agusdev.com.ar/ | grep -i -E "^HTTP|^location"

# Rutas profundas (deben dar 200 con el HTML prerenderizado de esa ruta) y 404
curl -s HOST/en/projects/consultorio-odontologico | grep -o '<link rel="canonical"[^>]*>'
curl -sI HOST/es/nada | grep -i "^HTTP"
curl -s HOST/sitemap.xml | head -5
curl -s HOST/robots.txt

# Cabeceras
curl -sI HOST/es | grep -i -E "content-security|strict-transport|x-frame|x-content"
```

En el navegador (ES y EN): refrescar en `/en/projects/<slug>`, comprobar la 404 y abrir la consola: **sin violaciones de CSP** (DevTools → Console, filtrar "Content Security Policy").

## 5. Previews de enlaces

Compartir `HOST/es` y `HOST/en` (y un detalle de proyecto) en:

- WhatsApp (pegar el enlace en un chat contigo mismo).
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/ (botón "Scrape Again" para refrescar caché).

Si cambia el copy o el diseño: `npm run og`, commitear `public/og/**` y redeplegar. Las plataformas cachean la imagen; usar "Scrape Again".

## 6. Analítica (opcional)

Sin analítica por defecto (sin cookies, sin terceros). Si se decide sumar **Vercel Web Analytics**:

1. Activarla en el proyecto (pestaña Analytics) e instalar `@vercel/analytics`.
2. El script se sirve desde el mismo origen (`/_vercel/insights/…`), así que `script-src 'self'` y `connect-src 'self'` de la CSP deberían alcanzar; confirmarlo en consola tras desplegar. Si hubiera una violación, ampliar la CSP en `vercel.json`.
3. Si se toca el script inline de `index.html`, recalcular su hash en la CSP (el build falla si no coincide y dice cuál es).
4. Verificar que la regla de rewrite SPA no intercepte `/_vercel/*`.

## 7. Lighthouse de producción

Fuera del proyecto (no se agrega como dependencia):

```bash
npx lighthouse@latest HOST/es --preset=desktop --output=json --output-path=./lh-home-desktop.json --chrome-flags="--headless=new"
npx lighthouse@latest HOST/es --output=json --output-path=./lh-home-mobile.json --chrome-flags="--headless=new"
```

Repetir con `/es/proyectos` y `/es/proyectos/consultorio-odontologico`. Referencia (build local emulando `vercel.json`): desktop 99; mobile home 94, índice 87, detalle 88; Accessibility/Best Practices/SEO 100.

## 8. Merge a `main`

Cuando producción esté validada:

```bash
git checkout main
git merge --no-ff rediseno
git push origin main
```

Con eso Vercel despliega Production desde `main`.

## 7. Alternativa: Cloudflare Pages

El repo también despliega en Cloudflare Pages (convive con Vercel; cada plataforma ignora los archivos de la otra).

| Qué | Vercel | Cloudflare Pages |
|---|---|---|
| Redirect de `/` por cookie / idioma | `vercel.json` | `worker/index.js` (Workers) o `functions/index.js` (Pages) |
| Fallback SPA | `rewrites` en `vercel.json` | `not_found_handling` en `wrangler.jsonc` (Pages lo hace por defecto) |
| Headers de seguridad y caché | `headers` en `vercel.json` | `public/_headers` |
| Versión de Node | Settings → General | `.node-version` (22.22.0) |

1. Workers & Pages → Create → Pages → Connect to Git → `Agustcc99/Portafolio`.
2. Build command `npm run build`, output directory `dist`.
3. Custom domains → agregar `agusdev.com.ar` (con DNS en Cloudflare el proxy naranja funciona).
4. Si cambiás los headers o la CSP en `vercel.json`, replicalos en `public/_headers`.
5. Para que un `*.pages.dev` tenga canonical propio: variable `SITE_URL` en el entorno de Preview.

Diferencia conocida: las rutas inexistentes (`/es/nada`) devuelven 200 con la SPA en Cloudflare, no 404.

Si Cloudflare te propone `Deploy command: npx wrangler deploy` (Workers Builds), se usa `wrangler.jsonc` + `worker/`; `functions/` es solo para Pages clásico.
