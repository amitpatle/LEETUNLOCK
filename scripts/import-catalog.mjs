import { mkdir, writeFile } from 'node:fs/promises'
const out = new URL('../public/data/problems.json', import.meta.url)
const legacyUrl = process.env.ALGOATLAS_DATA_URL
const headers = { 'User-Agent': 'LEETUNLOCK educational catalog importer', Referer: 'https://leetcode.com/problemset/' }
let list
if (legacyUrl) {
  console.log(`Downloading catalog from ${legacyUrl}`)
  const response = await fetch(legacyUrl, { headers })
  if (!response.ok) throw new Error(`Catalog download failed: HTTP ${response.status}.`)
  const text = await response.text()
  if (text.trimStart().startsWith('<')) throw new Error('Catalog download returned HTML instead of JSON.')
  let raw
  try { raw = JSON.parse(text) } catch { throw new Error('Catalog download returned invalid JSON.') }
  list = Array.isArray(raw) ? raw : raw.problems || raw.questions || raw.data?.problemsetQuestionList?.questions || []
} else {
  console.log('Downloading the current catalog from LeetCode GraphQL')
  list = []
  for (let skip = 0; skip < 5000; skip += 100) {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { problemsetQuestionListV2(categorySlug: "", limit: 100, skip: ${skip}) { questions { questionFrontendId title titleSlug difficulty paidOnly topicTags { name slug } } } }` })
    })
    if (!response.ok) throw new Error(`LeetCode catalog request failed: HTTP ${response.status}.`)
    const json = await response.json()
    const batch = json.data?.problemsetQuestionListV2?.questions || []
    if (!batch.length) break
    list.push(...batch)
  }
}
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
await writeFile(out, JSON.stringify({
  source: legacyUrl || 'https://leetcode.com/graphql',
  fetchedAt: new Date().toISOString(),
  count: problems.length,
  problems
}, null, 2))
console.log(`Saved ${problems.length} unique problems to ${out.pathname}`)
