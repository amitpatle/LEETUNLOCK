import { readFile, writeFile } from 'node:fs/promises'

const catalogPath = new URL('../public/data/problems.json', import.meta.url)
const curatedPath = new URL('../public/data/curated-problems.json', import.meta.url)

const catalogRaw = JSON.parse(await readFile(catalogPath, 'utf8'))
const catalog = Array.isArray(catalogRaw) ? catalogRaw : catalogRaw.problems || []
const existingRaw = JSON.parse(await readFile(curatedPath, 'utf8'))
const existing = Array.isArray(existingRaw) ? existingRaw : existingRaw.problems || []
const catalogIds = new Set(catalog.map(problem => String(problem.id)))
const problems = existing.filter(problem => catalogIds.has(String(problem.id)))
await writeFile(curatedPath, JSON.stringify({
  source: 'Enriched records; remaining catalog problems use bundled metadata without duplicate copies.',
  generatedAt: new Date().toISOString(),
  count: problems.length,
  problems
}, null, 2) + '\n')
console.log(`Saved ${problems.length} enriched records; ${catalog.length} catalog records remain available through the main catalog.`)
