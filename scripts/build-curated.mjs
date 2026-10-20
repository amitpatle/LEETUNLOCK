import { readFile, writeFile } from 'node:fs/promises'

const catalogPath = new URL('../public/data/problems.json', import.meta.url)
const curatedPath = new URL('../public/data/curated-problems.json', import.meta.url)

const catalogRaw = JSON.parse(await readFile(catalogPath, 'utf8'))
const catalog = Array.isArray(catalogRaw) ? catalogRaw : catalogRaw.problems || []
const existingRaw = JSON.parse(await readFile(curatedPath, 'utf8'))
const existing = Array.isArray(existingRaw) ? existingRaw : existingRaw.problems || []
const byId = new Map(existing.map(problem => [String(problem.id), problem]))

for (const problem of catalog) {
  const id = String(problem.id)
  if (byId.has(id)) continue
  byId.set(id, {
    id,
    title: problem.title || `Problem ${id}`,
    slug: problem.slug || '',
    difficulty: problem.difficulty || 'Unknown',
    tags: problem.topics || [],
    summary: problem.description || 'Review the problem statement and practice an implementation in the editor.',
    examples: problem.examples || [],
    constraints: problem.constraints || [],
    hints: problem.hints || [],
    solutions: problem.code_snippets || {},
    externalUrl: problem.url
  })
}

const problems = [...byId.values()]
await writeFile(curatedPath, JSON.stringify({
  source: 'Generated from the bundled catalog; existing enriched records are preserved.',
  generatedAt: new Date().toISOString(),
  count: problems.length,
  problems
}, null, 2) + '\n')
console.log(`Saved ${problems.length} curated learning records.`)
