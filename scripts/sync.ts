// npm run sync [-- --with-images]
// Скачивает фид surprise.by, нормализует в public/data/products.json.
import Papa from 'papaparse'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { AUDIENCE, CATEGORIES, GIFTCARD_TAGS, OCCASIONS } from './taxonomy'

const FEED = 'https://surprise.by/google_merchant.csv'
const OUT = path.resolve('public/data')
const withImages = process.argv.includes('--with-images')
const localFeed = process.env.FEED_FILE // для офлайна: FEED_FILE=путь\к\csv

type Row = Record<string, string>

function bucket(p: number) {
  return p < 50 ? 'lt50' : p <= 100 ? '50-100' : p <= 300 ? '100-300' : 'gt300'
}
const uniq = <T>(a: T[]) => [...new Set(a)]

async function loadCsv(): Promise<string> {
  if (localFeed) return readFile(localFeed, 'utf8')
  const res = await fetch(FEED)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function main() {
  const text = (await loadCsv()).replace(/^\uFEFF/, '')
  const { data } = Papa.parse<Row>(text, { header: true, delimiter: '|', skipEmptyLines: true })
  const seen = new Set<string>()
  const products = []
  for (const r of data) {
    const id = (r.id || '').trim()
    const priceByn = parseFloat((r.price || '').replace(/[^\d.,]/g, '').replace(',', '.'))
    if (!id || seen.has(id) || !r.link || !r.image_link || !(priceByn > 0)) continue
    seen.add(id)
    const tags = (r.product_type || '').split(',').map((t) => t.trim()).filter(Boolean)
    products.push({
      id,
      title: r.title.trim(),
      description: r.description.replace(/\.{2,}/g, '.').replace(/\s+/g, ' ').trim(),
      url: r.link.trim(),
      image: r.image_link.trim(),
      images: (r.additional_image_link || '').split(',').map((s) => s.trim()).filter(Boolean),
      video: r.video_link?.trim() || undefined,
      priceByn,
      audience: uniq(tags.map((t) => AUDIENCE[t]).filter(Boolean)),
      occasions: uniq(tags.map((t) => OCCASIONS[t]).filter(Boolean)),
      categories: uniq(tags.map((t) => CATEGORIES[t]).filter(Boolean)),
      priceBucket: bucket(priceByn),
      isGiftCard: tags.some((t) => GIFTCARD_TAGS.includes(t)) || /^(набор|универсальный)/i.test(r.title.trim()),
    })
  }
  if (products.length < 20) throw new Error(`Подозрительно мало позиций: ${products.length}`)

  await mkdir(OUT, { recursive: true })

  if (withImages) {
    const dir = path.resolve('public/img')
    await mkdir(dir, { recursive: true })
    let n = 0
    for (const p of products as Array<Record<string, unknown> & { id: string; image: string }>) {
      const name = `${p.id}${path.extname(new URL(p.image).pathname) || '.jpg'}`
      const file = path.join(dir, name)
      if (!existsSync(file)) {
        try {
          await writeFile(file, Buffer.from(await (await fetch(p.image)).arrayBuffer()))
          n++
        } catch { continue /* оставим удалённый URL */ }
      }
      p.imageLocal = `img/${name}`
    }
    console.log(`✓ изображений скачано: ${n}`)
  }

  await writeFile(path.join(OUT, 'products.json'), JSON.stringify(products))
  await writeFile(path.join(OUT, 'meta.json'), JSON.stringify({ syncedAt: new Date().toISOString(), count: products.length }))
  console.log(`✓ ${products.length} позиций`)
}

main().catch((e) => {
  console.error('✗ sync не удался, остаётся прошлый снимок:', e.message)
  process.exit(existsSync(path.join(OUT, 'products.json')) ? 0 : 1)
})
