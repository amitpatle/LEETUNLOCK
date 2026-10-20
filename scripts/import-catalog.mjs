import { mkdir, writeFile } from 'node:fs/promises'
const url = process.env.ALGOATLAS_DATA_URL || 'https://raw.githubusercontent.com/neenza/leetcode-problems/main/merged_problems.json'
const out = new URL('../public/data/problems.json', import.meta.url)
console.log(`Downloading catalog from ${url}`)
const response = await fetch(url, { headers: { 'User-Agent': 'AlgoAtlas educational catalog importer' } })
if (!response.ok) throw new Error(`Catalog download failed: HTTP ${response.status}. Try opening the source URL in a browser or set ALGOATLAS_DATA_URL.`)
const text = await response.text()
if (text.trimStart().startsWith('<')) {
  throw new Error('Catalog download returned HTML instead of JSON. Check the source URL or set ALGOATLAS_DATA_URL to a valid JSON endpoint.')
}
let raw
try {
  raw = JSON.parse(text)
} catch {
  throw new Error('Catalog download returned invalid JSON. Check the source URL or set ALGOATLAS_DATA_URL to a valid JSON endpoint.')
}
const list = Array.isArray(raw) ? raw : raw.problems || raw.questions || raw.data?.problemsetQuestionList?.questions || []
if (!list.length) throw new Error('The source response did not contain a recognized problem list.')
const seen = new Set()
const problems = list.map((p) => {
  const id = String(p.frontend_id ?? p.frontendQuestionId ?? p.problem_id ?? p.id ?? '')
  const slug = p.problem_slug ?? p.titleSlug ?? p.slug ?? ''
  return {
    id, title: p.title ?? p.title_name ?? 'Untitled problem',
    slug, difficulty: p.difficulty ?? 'Unknown',
    topics: p.topics ?? p.topicTags?.map(t => typeof t === 'string' ? t : t.name) ?? [],
    description: p.description ?? p.content ?? '',
    examples: p.examples ?? [], constraints: p.constraints ?? [],
    hints: p.hints ?? [], code_snippets: p.code_snippets ?? p.codeSnippets ?? {},
    premium: Boolean(p.paidOnly ?? p.isPaidOnly),
    url: slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/problemset/'
  }
}).filter(p => p.id && !seen.has(p.id) && seen.add(p.id))
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(out, JSON.stringify({ source: url, fetchedAt: new Date().toISOString(), count: problems.length, problems }, null, 2))
console.log(`Saved ${problems.length} unique problems to ${out.pathname}`)
