// Verifica que ES y EN tengan exactamente las mismas claves (incluido el largo de los arreglos).
// Uso: npm run i18n:check
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales')

function flatten(value, prefix = '', out = {}) {
  if (Array.isArray(value)) {
    out[`${prefix}.length`] = value.length
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out)
  } else {
    out[prefix] = typeof value
  }
  return out
}

let problems = 0
const files = await readdir(path.join(base, 'es'))
for (const file of files) {
  const [es, en] = await Promise.all(
    ['es', 'en'].map(async (l) => flatten(JSON.parse(await readFile(path.join(base, l, file), 'utf8')))),
  )
  for (const key of new Set([...Object.keys(es), ...Object.keys(en)])) {
    if (es[key] !== en[key]) {
      problems++
      console.error(`${file}: ${key} → es=${es[key] ?? '(falta)'} en=${en[key] ?? '(falta)'}`)
    }
  }
}

if (problems) {
  console.error(`\n${problems} diferencia(s) entre es y en.`)
  process.exit(1)
}
console.log(`i18n OK: ${files.length} archivos con claves idénticas en es y en.`)
