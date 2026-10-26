// Optimiza las capturas de proyectos: assets-src/proyectos/<dir>/<img>.png
//   → public/proyectos/<dir>/<img>-<ancho>.avif|webp (480 / 960 / 1600, sin agrandar)
//   → src/content/projects/images.generated.json (dimensiones, anchos y placeholder blur)
// Uso: npm run images
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'assets-src', 'proyectos')
const outDir = path.join(root, 'public', 'proyectos')
const manifestFile = path.join(root, 'src', 'content', 'projects', 'images.generated.json')

const WIDTHS = [480, 960, 1600]
const AVIF = { quality: 55, effort: 4 }
const WEBP = { quality: 78, effort: 5 }

async function listImages() {
  const files = []
  for (const dir of await readdir(srcDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const file of await readdir(path.join(srcDir, dir.name))) {
      if (/\.(png|jpe?g)$/i.test(file)) files.push({ dir: dir.name, name: path.parse(file).name, file })
    }
  }
  return files.sort((a, b) => `${a.dir}/${a.name}`.localeCompare(`${b.dir}/${b.name}`))
}

// Los PNG ya copiados y los derivados viejos se limpian para que public/ solo tenga lo optimizado.
await rm(outDir, { recursive: true, force: true })

const manifest = {}
let bytes = 0

for (const { dir, name, file } of await listImages()) {
  const input = path.join(srcDir, dir, file)
  const { width, height } = await sharp(input).metadata()
  if (!width || !height) throw new Error(`Sin dimensiones: ${input}`)

  const widths = WIDTHS.filter((w) => w < width)
  widths.push(Math.min(width, WIDTHS[WIDTHS.length - 1]))
  const unique = [...new Set(widths)].sort((a, b) => a - b)

  await mkdir(path.join(outDir, dir), { recursive: true })
  for (const w of unique) {
    const base = path.join(outDir, dir, `${name}-${w}`)
    const resized = sharp(input).resize({ width: w, withoutEnlargement: true })
    const [avif, webp] = await Promise.all([
      resized.clone().avif(AVIF).toBuffer(),
      resized.clone().webp(WEBP).toBuffer(),
    ])
    await Promise.all([writeFile(`${base}.avif`, avif), writeFile(`${base}.webp`, webp)])
    bytes += avif.length + webp.length
  }

  const blur = await sharp(input).resize({ width: 24 }).webp({ quality: 40 }).toBuffer()
  manifest[`${dir}/${name}`] = {
    width,
    height,
    widths: unique,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
  }
  console.log(`${dir}/${name}  ${width}x${height}  → ${unique.join('/')}`)
}

await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`\n${Object.keys(manifest).length} imágenes, ${(bytes / 1024 / 1024).toFixed(2)} MB generados.`)
