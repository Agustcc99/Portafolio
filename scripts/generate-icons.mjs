// Genera el set de íconos a partir de public/favicon.svg: favicon.ico, apple-touch-icon y los íconos del manifest.
// Uso: npm run icons
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const source = path.join(publicDir, 'favicon.svg')

const png = (size, file, input = source) =>
  sharp(input, { density: (72 * size) / 64 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
    .then(async (buffer) => {
      if (file) await writeFile(path.join(publicDir, file), buffer)
      return buffer
    })

// iOS aplica su propia máscara de esquinas: el ícono va a sangre completa, sin transparencia.
const squareSvg = (await readFile(source, 'utf8')).replace('rx="14"', 'rx="0"')
await png(180, 'apple-touch-icon.png', Buffer.from(squareSvg))
await png(192, 'icon-192.png')
await png(512, 'icon-512.png')

// ICO con PNG incrustados (16, 32 y 48 px): sharp no escribe .ico.
const sizes = [16, 32, 48]
const images = await Promise.all(sizes.map((size) => png(size)))
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2) // tipo: ícono
header.writeUInt16LE(sizes.length, 4)
let offset = header.length + sizes.length * 16
const entries = images.map((image, i) => {
  const entry = Buffer.alloc(16)
  entry.writeUInt8(sizes[i], 0)
  entry.writeUInt8(sizes[i], 1)
  entry.writeUInt16LE(1, 4) // planos
  entry.writeUInt16LE(32, 6) // bits por píxel
  entry.writeUInt32LE(image.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += image.length
  return entry
})
await writeFile(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]))
console.log('Íconos generados en public/')
