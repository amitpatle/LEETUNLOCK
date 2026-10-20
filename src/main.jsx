import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, SlidersHorizontal, Bookmark, CheckCircle2, ExternalLink, Heart, X, Sun, Moon, Database, Code2, ChevronRight, Sparkles, RefreshCw, Download, AlertCircle, Tag, Clock3, SearchX } from 'lucide-react'
import './style.css'

const REMOTE_DATA = 'https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json'
const CURATED_URL = '/data/curated-problems.json'
const LOCAL_URL = '/data/problems.json'

function normalizeTopics(value) {
  if (Array.isArray(value)) return value.map(topic => typeof topic === 'string' ? topic : topic?.name).filter(Boolean).map(String)
  if (value && typeof value === 'object') {
    return [value.primary, ...(Array.isArray(value.secondary) ? value.secondary : [])].filter(Boolean).map(String)
  }
  return []
}

function getStoredValue(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function readStoredList(key) {
  try {
    const value = JSON.parse(getStoredValue(key, '[]'))
    return Array.isArray(value) ? value.map(String) : []
  } catch {
    return []
  }
}

function formatExample(example) {
  if (typeof example === 'string') return example
  if (!example || typeof example !== 'object') return String(example)
  if (example.example_text || example.text) return example.example_text || example.text
  return [
    example.input && `Input: ${example.input}`,
    example.output && `Output: ${example.output}`,
    example.explanation && `Explanation: ${example.explanation}`
  ].filter(Boolean).join('\n\n') || JSON.stringify(example, null, 2)
}

function normalize(p, i = 0) {
  const slug = String(p.problem_slug ?? p.titleSlug ?? p.slug ?? '')
  const topics = normalizeTopics(p.topics ?? p.topicTags ?? p.tags)
  const id = String(p.frontend_id ?? p.frontendQuestionId ?? p.problem_id ?? p.id ?? i + 1)
  return {
    ...p, id, title: String(p.title ?? p.title_name ?? `Problem ${id}`),
    slug, difficulty: String(p.difficulty ?? 'Unknown'),
    topics,
    description: typeof (p.description ?? p.content) === 'string' ? (p.description ?? p.content) : '',
    examples: p.examples ?? [], constraints: p.constraints ?? [],
    hints: p.hints ?? [], snippets: p.code_snippets ?? p.codeSnippets ?? {},
    premium: Boolean(p.paidOnly ?? p.isPaidOnly),
    url: p.url ?? (slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/problemset/')
  }
}
function curatedNormalize(p) {
  return normalize({ ...p, id: p.id ?? p.problem_id, topics: p.tags ?? p.topics ?? [], description: p.summary ?? p.description, snippets: p.solutions ?? p.code_snippets })
}
function App() {
  const [problems, setProblems] = useState([])
  const [curated, setCurated] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [status, setStatus] = useState('All')
  const [premium, setPremium] = useState('All')
  const [selected, setSelected] = useState(null)
  const [solved, setSolved] = useState(() => readStoredList('aa-solved'))
  const [bookmarks, setBookmarks] = useState(() => readStoredList('aa-bookmarks'))
  const [dark, setDark] = useState(() => getStoredValue('aa-theme', 'dark') !== 'light')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { setStoredValue('aa-solved', JSON.stringify(solved)) }, [solved])
  useEffect(() => { setStoredValue('aa-bookmarks', JSON.stringify(bookmarks)) }, [bookmarks])
  useEffect(() => { setStoredValue('aa-theme', dark ? 'dark' : 'light') }, [dark])

  async function loadCatalog() {
    setLoading(true); setError('')
    let curatedRecords = []
    try {
      const curatedRes = await fetch(CURATED_URL)
      if (curatedRes.ok) {
        const c = await curatedRes.json()
        curatedRecords = (c.problems || []).map(curatedNormalize)
        setCurated(curatedRecords)
      }
      let response = await fetch(LOCAL_URL)
      if (response.ok) {
        const text = await response.text()
        if (!text.trimStart().startsWith('<')) {
          const json = JSON.parse(text)
          const arr = Array.isArray(json) ? json : json.problems || json.data?.problemsetQuestionList?.questions || []
          if (arr.length) { setProblems(arr.map(normalize)); setSource('local'); setLoading(false); return }
        }
      }
      response = await fetch(REMOTE_DATA)
      if (!response.ok) throw new Error(`Catalog source returned HTTP ${response.status}`)
      const text = await response.text()
      if (text.trimStart().startsWith('<')) throw new Error('The online catalog returned an HTML page instead of JSON.')
      const json = JSON.parse(text)
      const arr = Array.isArray(json) ? json : json.problems || json.data?.problemsetQuestionList?.questions || []
      if (!arr.length) throw new Error('The catalog source did not return a recognizable problem list.')
      setProblems(arr.map(normalize)); setSource('remote')
    } catch (e) {
      setProblems([])
      setError(curatedRecords.length ? '' : (e.message || 'Could not load the catalog.'))
      setSource('curated')
    } finally { setLoading(false) }
  }
  useEffect(() => { loadCatalog() }, [])

  const curatedById = useMemo(() => new Map(curated.map(p => [String(p.id), p])), [curated])
  const all = useMemo(() => {
    const merged = problems.map(p => {
      const c = curatedById.get(String(p.id))
      return c ? { ...p, ...c, id: String(p.id), topics: p.topics?.length ? p.topics : c.topics, url: p.url } : p
    })
    const ids = new Set(merged.map(p => String(p.id)))
    curated.forEach(p => { if (!ids.has(String(p.id))) merged.push({ ...p, hasCurated: true }) })
    return merged
  }, [problems, curated, curatedById])

  const topics = useMemo(() => [...new Set(all.flatMap(p => p.topics || []).filter(Boolean))].sort((a,b) => a.localeCompare(b)), [all])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(p => {
      const text = [p.title, p.id, p.slug, ...(p.topics || []), p.description].join(' ').toLowerCase()
      return (!q || text.includes(q)) &&
        (difficulty === 'All' || p.difficulty.toLowerCase() === difficulty.toLowerCase()) &&
        (topic === 'All' || p.topics.some(t => t.toLowerCase() === topic.toLowerCase())) &&
        (status === 'All' || (status === 'Solved' ? solved.includes(String(p.id)) : status === 'Bookmarked' ? bookmarks.includes(String(p.id)) : !solved.includes(String(p.id)))) &&
        (premium === 'All' || (premium === 'Free' ? !p.premium : p.premium))
    })
  }, [all, query, difficulty, topic, status, premium, solved, bookmarks])

  const stats = useMemo(() => ({
    total: all.length,
    easy: all.filter(p => p.difficulty === 'Easy').length,
    medium: all.filter(p => p.difficulty === 'Medium').length,
    hard: all.filter(p => p.difficulty === 'Hard').length,
    done: solved.filter(id => all.some(p => String(p.id) === String(id))).length
  }), [all, solved])
  const toggle = (arr, setter, id) => setter(arr.includes(String(id)) ? arr.filter(x => x !== String(id)) : [...arr, String(id)])
  const clearFilters = () => { setQuery(''); setDifficulty('All'); setTopic('All'); setStatus('All'); setPremium('All') }
  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ solved, bookmarks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leetunlock-progress.json'; a.click(); URL.revokeObjectURL(a.href)
  }

  return <div className={dark ? 'app dark' : 'app light'}>
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">&gt;_</span><span>LEET<span className="brand-accent">UNLOCK</span><small>THE CODING WORKSPACE</small></span></a>
      <nav><a className="nav-active" href="#catalog">Catalog</a><a href="#progress">Progress</a><a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer">LeetCode <ExternalLink size={13}/></a><a className="sponsor-link" href="https://github.com/sponsors/amitpatle" target="_blank" rel="noreferrer"><Heart size={13}/> Sponsor</a></nav>
      <div className="top-actions"><button className="icon-button" title="Export progress" onClick={exportProgress}><Download size={17}/></button><button className="icon-button" title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> YOUR INTERVIEW PREP WORKSPACE</div><h1>Unlock your next<br/><span>breakthrough.</span></h1><p>A focused command center for coding practice. Search by concept, filter by difficulty, and turn every problem into progress.</p><div className="hero-meta"><span><Database size={14}/>{loading ? 'Loading catalog…' : `${stats.total.toLocaleString()} problems indexed`}</span><span className="dot-sep">·</span><span>{curated.length} curated learning records</span></div></div>
        <div className="hero-art" aria-hidden="true"><img src="/leetunlock-preview.svg" alt="" /></div>
      </section>
      <section id="progress" className="stats-grid">
        <div className="stat-card"><span className="stat-label">TOTAL PROBLEMS</span><strong>{loading ? '—' : stats.total.toLocaleString()}</strong><small>Across all topics</small></div>
        <div className="stat-card"><span className="stat-label">EASY</span><strong className="easy-text">{stats.easy.toLocaleString()}</strong><small>Build your base</small></div>
        <div className="stat-card"><span className="stat-label">MEDIUM</span><strong className="medium-text">{stats.medium.toLocaleString()}</strong><small>Sharpen patterns</small></div>
        <div className="stat-card"><span className="stat-label">HARD</span><strong className="hard-text">{stats.hard.toLocaleString()}</strong><small>Master the edge</small></div>
        <div className="stat-card progress-stat"><span className="stat-label">YOUR PROGRESS</span><strong>{stats.done}<em> / {stats.total || '—'}</em></strong><div className="progress-track"><span style={{width: `${stats.total ? Math.min(100, stats.done / stats.total * 100) : 0}%`}}/></div><small>{stats.total ? Math.round(stats.done / stats.total * 100) : 0}% completed</small></div>
      </section>
      <section id="catalog" className="catalog-section">
        <div className="section-heading"><div><div className="eyebrow">THE LIBRARY</div><h2>Problem catalog <span className="count-pill">{visible.length.toLocaleString()}</span></h2></div><button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16}/> Filters <span>{[difficulty !== 'All', topic !== 'All', status !== 'All', premium !== 'All'].filter(Boolean).length}</span></button></div>
        <div className="search-row"><div className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search titles, IDs, topics, or concepts…" /><kbd>⌘ K</kbd>{query && <button className="clear-search" onClick={() => setQuery('')}><X size={15}/></button>}</div><button className="refresh-button" onClick={loadCatalog} title="Reload catalog"><RefreshCw size={17}/></button></div>
        {showFilters && <div className="filters-panel">
          <label>DIFFICULTY<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
          <label>TOPIC<select value={topic} onChange={e => setTopic(e.target.value)}><option>All</option>{topics.map(t => <option key={t}>{t}</option>)}</select></label>
          <label>MY STATUS<select value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option>Unsolved</option><option>Solved</option><option>Bookmarked</option></select></label>
          <label>ACCESS<select value={premium} onChange={e => setPremium(e.target.value)}><option>All</option><option>Free</option><option>Premium</option></select></label>
          <button className="text-button" onClick={clearFilters}>Clear all</button>
        </div>}
        {error && <div className="notice"><AlertCircle size={17}/><div><strong>Online catalog wasn't loaded.</strong><p>{error}. Showing the curated records available in this project. If online access is blocked, run <code>npm run import:catalog</code> on a network that can access the source.</p></div><button onClick={loadCatalog}>Retry</button></div>}
        {source === 'remote' && <div className="source-note"><span className="source-dot"></span> Catalog loaded from public dataset · curated content is merged when IDs match</div>}
        {loading ? <div className="loading-state"><div className="spinner"></div><p>Mapping the problem universe…</p></div> : visible.length === 0 ? <div className="empty-state"><SearchX size={32}/><h3>No problems found</h3><p>Try a different search or clear your filters.</p><button className="secondary-button" onClick={clearFilters}>Reset filters</button></div> : <div className="problem-list">
          <div className="list-header"><span>PROBLEM</span><span>TOPICS</span><span>DIFFICULTY</span><span>STATUS</span></div>
          {visible.map(p => <article className="problem-row" key={`${p.id}-${p.slug}`} onClick={() => setSelected(p)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelected(p)}>
            <div className="problem-main"><span className="problem-id">{p.id.padStart ? `#${p.id}` : p.id}</span><div className="problem-name"><strong>{p.title}</strong><small>{p.premium ? 'PREMIUM' : p.hasCurated || curatedById.has(String(p.id)) ? 'CURATED NOTES AVAILABLE' : p.slug || 'PROBLEM'}</small></div></div>
            <div className="topic-list">{(p.topics || []).slice(0, 2).map(t => <span className="topic-chip" key={t}>{t}</span>)}{(p.topics || []).length > 2 && <span className="topic-more">+{p.topics.length - 2}</span>}</div>
            <div><span className={`difficulty diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></div>
            <div className="row-status"><button title={solved.includes(String(p.id)) ? 'Mark unsolved' : 'Mark solved'} className={`row-action ${solved.includes(String(p.id)) ? 'is-done' : ''}`} onClick={e => { e.stopPropagation(); toggle(solved, setSolved, p.id) }}><CheckCircle2 size={17}/></button><button title={bookmarks.includes(String(p.id)) ? 'Remove bookmark' : 'Bookmark'} className={`row-action ${bookmarks.includes(String(p.id)) ? 'is-bookmarked' : ''}`} onClick={e => { e.stopPropagation(); toggle(bookmarks, setBookmarks, p.id) }}><Bookmark size={16}/></button><ChevronRight size={16} className="row-chevron"/></div>
          </article>)}
        </div>}
        <div className="catalog-footer"><span>LEETUNLOCK / INDEX V1.0</span><span>Progress stored locally on this device</span></div>
      </section>
    </main>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="detail-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-top"><span className="eyebrow">PROBLEM DETAIL / #{selected.id}</span><button className="icon-button" onClick={() => setSelected(null)}><X size={18}/></button></div>
      <h2>{selected.title}</h2><div className="modal-meta"><span className={`difficulty diff-${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span>{selected.premium && <span className="topic-chip">Premium</span>}{(selected.topics || []).map(t => <span className="topic-chip" key={t}>{t}</span>)}</div>
      <div className="modal-actions"><button className={solved.includes(String(selected.id)) ? 'primary-button done-button' : 'primary-button'} onClick={() => toggle(solved, setSolved, selected.id)}><CheckCircle2 size={16}/>{solved.includes(String(selected.id)) ? 'Solved' : 'Mark as solved'}</button><button className="secondary-button" onClick={() => toggle(bookmarks, setBookmarks, selected.id)}><Bookmark size={16}/>{bookmarks.includes(String(selected.id)) ? 'Bookmarked' : 'Bookmark'}</button><a className="secondary-button" href={selected.url} target="_blank" rel="noreferrer">Open on LeetCode <ExternalLink size={14}/></a></div>
      <div className="detail-content">
        {selected.summary && <><h3>How to think</h3><p>{selected.summary}</p></>}
        {selected.description ? <><h3>Problem statement</h3><div className="statement" dangerouslySetInnerHTML={{__html: String(selected.description).startsWith('<') ? selected.description : String(selected.description).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/\r?\n/g, '<br/>')}} /></> : <div className="notice compact"><AlertCircle size={16}/>Full statement isn't included in this metadata record. Open the canonical problem page for the full prompt.</div>}
        {selected.examples?.length > 0 && <><h3>Examples</h3>{selected.examples.map((ex, i) => <pre className="example" key={i}>{formatExample(ex)}</pre>)}</>}
        {selected.constraints?.length > 0 && <><h3>Constraints</h3><ul>{selected.constraints.map((c, i) => <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>)}</ul></>}
        {selected.hints?.length > 0 && <><h3>Hints</h3><ol>{selected.hints.map((h, i) => <li key={i}>{typeof h === 'string' ? h : JSON.stringify(h)}</li>)}</ol></>}
        {selected.solutions && typeof selected.solutions === 'object' && <><h3>Curated solutions</h3>{Object.entries(selected.solutions).map(([lang, solution]) => <div key={lang} className="code-block"><div className="code-title"><Code2 size={14}/>{lang}</div><pre>{typeof solution === 'string' ? solution : solution?.code || JSON.stringify(solution, null, 2)}</pre></div>)}</>}
        {selected.snippets && Object.keys(selected.snippets).length > 0 && <><h3>Starter code</h3>{Object.entries(selected.snippets).slice(0, 3).map(([lang, code]) => <div key={lang} className="code-block"><div className="code-title"><Code2 size={14}/>{lang}</div><pre>{typeof code === 'string' ? code : JSON.stringify(code, null, 2)}</pre></div>)}</>}
      </div>
    </section></div>}
    <footer className="site-footer"><span>&gt;_ LEETUNLOCK</span><span>Built for learning, not shortcuts.</span><span>Problem content belongs to its respective owners.</span></footer>
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
