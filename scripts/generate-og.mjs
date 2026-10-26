// Genera las imágenes Open Graph (1200×630) con Chrome headless: una por idioma y una por proyecto e idioma.
// Salida: public/og/<idioma>.jpg y public/og/<idioma>/<slug>.jpg. Uso: npm run og
// Necesita Chrome o Edge instalado (variable CHROME_PATH para indicar otro ejecutable).
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { fromRoot, loadImageIndex, loadLocale, loadProjects, locales, pathToFileURL } from './lib/content.mjs'

const run = promisify(execFile)

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
const chrome = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
if (!chrome) throw new Error('No se encontró Chrome/Edge: definí CHROME_PATH.')

const fontUrl = (pkg, file) => pathToFileURL(fromRoot('node_modules', pkg, 'files', file)).href
const FONTS = `
@font-face{font-family:Bricolage;src:url(${fontUrl('@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2')});font-weight:200 800}
@font-face{font-family:Geist;src:url(${fontUrl('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2')});font-weight:100 900}
@font-face{font-family:GeistMono;src:url(${fontUrl('@fontsource-variable/geist-mono', 'geist-mono-latin-wght-normal.woff2')});font-weight:100 900}
@font-face{font-family:Serif;font-style:italic;src:url(${fontUrl('@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff2')})}
`

const CSS = `
${FONTS}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#0a0a0c;color:#a4a4ae;font-family:Geist,sans-serif}
.bg{position:absolute;inset:0;background:
  radial-gradient(60% 80% at 82% 0%,rgba(196,245,66,.16),transparent 70%),
  radial-gradient(circle,rgba(255,255,255,.11) 1.2px,transparent 1.6px) 0 0/32px 32px;
  -webkit-mask-image:radial-gradient(90% 100% at 70% 30%,#000 30%,transparent 100%);mask-image:radial-gradient(90% 100% at 70% 30%,#000 30%,transparent 100%)}
.frame{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;font:600 26px Bricolage;color:#f5f5f7;letter-spacing:-.02em}
.mono{display:grid;place-items:center;width:44px;height:44px;border-radius:10px;background:#c4f542;color:#0c1203;font:800 28px/1 Bricolage}
.label{font:500 20px GeistMono;letter-spacing:.12em;text-transform:uppercase;color:#80808b}
.label b{font-weight:500;color:#c4f542}
h1{font:700 76px/.98 Bricolage;letter-spacing:-.035em;color:#f5f5f7;text-wrap:balance}
h1 em{font:italic 400 1.04em Serif;letter-spacing:-.01em;color:#c4f542}
.grow{flex:1}
.foot{display:flex;justify-content:space-between;align-items:flex-end;font:500 22px GeistMono;color:#80808b;letter-spacing:.04em}
.foot strong{display:block;margin-bottom:6px;font:600 30px Bricolage;letter-spacing:-.02em;color:#f5f5f7}
.home h1{font-size:96px;max-width:980px}
.project .text{width:540px}
.project h1{font-size:58px}
.card{position:absolute;right:64px;top:92px;width:520px;height:446px;border-radius:22px;border:1px solid rgba(255,255,255,.16);background:#101014;box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}
.card img{width:100%;height:100%;object-fit:cover;object-position:top left}
.card .ph{display:grid;place-items:center;height:100%;font:italic 400 120px Serif;color:#c4f542;background:radial-gradient(circle,rgba(255,255,255,.1) 1.2px,transparent 1.6px) 0 0/22px 22px,#101014}
`

const esc = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
/** `<em>` de los textos se conserva; el resto se escapa. */
const withEm = (text) =>
  text
    .split(/(<em>.*?<\/em>)/)
    .map((part) => (part.startsWith('<em>') ? part : esc(part)))
    .join('')

const footer = ({ home, seo }) =>
  `<div class="foot"><div><strong>Agustín Tacconi</strong>${esc(seo.person.jobTitle)}</div><div>${esc(home.hero.statStack)}</div></div>`

function homeHtml(data) {
  return `<style>${CSS}</style><div class="bg"></div>
<div class="frame home">
  <div class="brand"><span class="mono">A</span>Agustín.dev</div>
  <div class="grow"></div>
  <h1>${withEm(data.home.hero.title)}</h1>
  <div class="grow"></div>
  ${footer(data)}
</div>`
}

function projectHtml(data, project, text, images) {
  const { projects } = data
  const cover = project.images[0]
  const meta = cover ? images[cover] : null
  const width = meta ? (meta.widths.includes(960) ? 960 : Math.max(...meta.widths)) : null
  const media = cover
    ? `<img src="${pathToFileURL(fromRoot('public', 'proyectos', `${cover}-${width}.webp`)).href}" alt="">`
    : `<div class="ph">${esc(projects.categories[project.category])}</div>`
  return `<style>${CSS}</style><div class="bg"></div>
<div class="frame project">
  <div class="brand"><span class="mono">A</span>Agustín.dev</div>
  <div class="grow"></div>
  <div class="text">
    <p class="label" style="margin-bottom:22px"><b>${String(project.order).padStart(2, '0')}</b> — ${esc(projects.categories[project.category])}</p>
    <h1>${esc(text.title)}</h1>
  </div>
  <div class="grow"></div>
  ${footer(data)}
</div>
<div class="card">${media}</div>`
}

const tmp = await mkdtemp(path.join(os.tmpdir(), 'og-'))
const images = await loadImageIndex()
const projects = await loadProjects()

async function shoot(html, out) {
  const page = path.join(tmp, 'page.html')
  const raw = path.join(tmp, 'shot.png')
  await writeFile(page, `<!doctype html><meta charset="utf-8">${html}`)
  await run(chrome, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${raw}`,
    pathToFileURL(page).href,
  ])
  await mkdir(path.dirname(out), { recursive: true })
  await sharp(raw)
    .extract({ left: 0, top: 0, width: 1200, height: 630 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out)
}

try {
  for (const locale of locales) {
    const data = await loadLocale(locale)
    await shoot(homeHtml(data), fromRoot('public', 'og', `${locale}.jpg`))
    for (const project of projects) {
      const text = data.projects.items[project.slug]
      await shoot(projectHtml(data, project, text, images), fromRoot('public', 'og', locale, `${project.slug}.jpg`))
    }
    console.log(`OG ${locale}: inicio + ${projects.length} proyectos`)
  }
} finally {
  await rm(tmp, { recursive: true, force: true })
}
