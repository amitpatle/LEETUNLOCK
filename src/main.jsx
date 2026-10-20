import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, SlidersHorizontal, Bookmark, CheckCircle2, ExternalLink, Heart, X, Sun, Moon, Database, Code2, ChevronRight, Sparkles, RefreshCw, Download, AlertCircle, Tag, Clock3, SearchX, ArrowUp, Mail } from 'lucide-react'
import './style.css'

const REMOTE_DATA = 'https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json'
const CURATED_URL = '/data/curated-problems.json'
const LOCAL_URL = '/data/problems.json'
const JUDGE0_URL = 'https://ce.judge0.com'
const DEVELOPER = {
  name: 'A M i T',
  username: 'amitpatle',
  bio: 'There is always one more bug to fix',
  avatar: 'https://avatars.githubusercontent.com/u/92509904?v=4',
  profileUrl: 'https://github.com/amitpatle',
  repositoryUrl: 'https://github.com/amitpatle/LEETUNLOCK',
  publicRepos: 39,
  followers: 29
}
const DSA_LIBRARY = [
  {
    topic: 'Complexity and problem solving',
    learn: 'Learn Big-O by counting operations, then trace small examples by hand. For every solution, write its time and space complexity before optimizing it.',
    resources: [['MIT 6.006 Introduction to Algorithms', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/'], ['CS50x', 'https://cs50.harvard.edu/x/']]
  },
  {
    topic: 'Arrays, strings, and hashing',
    learn: 'Master indexing, frequency maps, prefix sums, two pointers, and sliding windows. Solve a simple version first, then identify the reusable pattern.',
    resources: [['freeCodeCamp Algorithms', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/'], ['VisuAlgo', 'https://visualgo.net/en']]
  },
  {
    topic: 'Linked lists, stacks, and queues',
    learn: 'Implement each structure from scratch. Practice pointer movement, fast and slow pointers, monotonic stacks, and breadth-first traversal.',
    resources: [['OpenDSA interactive modules', 'https://opendsa-server.cs.vt.edu/'], ['Open Data Structures', 'https://opendatastructures.org/']]
  },
  {
    topic: 'Sorting and searching',
    learn: 'Implement selection, insertion, merge, and quick sort. Then practice binary search by defining the search range, condition, and loop invariant.',
    resources: [['Khan Academy algorithms', 'https://www.khanacademy.org/computing/computer-science/algorithms'], ['VisuAlgo sorting', 'https://visualgo.net/en/sorting']]
  },
  {
    topic: 'Trees and heaps',
    learn: 'Learn recursive tree traversals before iterative versions. Add binary search trees, priority queues, tries, and lowest-common-ancestor problems.',
    resources: [['OpenDSA trees', 'https://opendsa-server.cs.vt.edu/'], ['TheAlgorithms GitHub', 'https://github.com/TheAlgorithms']]
  },
  {
    topic: 'Graphs',
    learn: 'Represent graphs with adjacency lists, then master BFS, DFS, connected components, topological sorting, shortest paths, and union-find.',
    resources: [['MIT 6.006 lectures', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/'], ['VisuAlgo graph', 'https://visualgo.net/en/graphds']]
  },
  {
    topic: 'Recursion and backtracking',
    learn: 'Write the base case and state transition before coding. Practice subsets, permutations, combinations, grid search, and constraint pruning.',
    resources: [['freeCodeCamp YouTube', 'https://www.youtube.com/@freecodecamp'], ['OpenDSA recursion', 'https://opendsa-server.cs.vt.edu/']]
  },
  {
    topic: 'Greedy and dynamic programming',
    learn: 'For greedy problems, prove why the local choice works. For DP, define state, transition, base cases, and iteration order before memoizing.',
    resources: [['MIT 6.006 notes', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/'], ['cp-algorithms', 'https://cp-algorithms.com/']]
  }
]
const LANGUAGES = {
  python: { label: 'Python', id: 71, starter: '# Write your solution here\nprint("Hello, LeetUnlock!")' },
  javascript: { label: 'JavaScript', id: 63, starter: '// Write your solution here\nconsole.log("Hello, LeetUnlock!")' },
  cpp: { label: 'C++', id: 54, starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, LeetUnlock!" << endl;\n  return 0;\n}' },
  java: { label: 'Java', id: 62, starter: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, LeetUnlock!");\n  }\n}' }
}

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
    id, title: String(p.title ?? p.title_name ?? `Problem ${id}`),
    slug, difficulty: String(p.difficulty ?? 'Unknown'),
    topics,
    description: typeof (p.description ?? p.content) === 'string' ? (p.description ?? p.content) : '',
    examples: p.examples ?? [], constraints: p.constraints ?? [],
    hints: p.hints ?? [], snippets: p.snippets ?? p.code_snippets ?? p.codeSnippets ?? {},
    premium: Boolean(p.paidOnly ?? p.isPaidOnly),
    url: p.url ?? p.externalUrl ?? (slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/problemset/'),
    ...(p.summary ? { summary: String(p.summary) } : {}),
    ...(p.solutions ? { solutions: p.solutions } : {})
  }
}
function curatedNormalize(p) {
  return normalize({ ...p, id: p.id ?? p.problem_id, topics: p.tags ?? p.topics ?? [], description: p.summary ?? p.description, snippets: p.solutions ?? p.code_snippets })
}

function getStarterCode(problem, language) {
  const snippet = problem?.snippets?.[language] ?? problem?.snippets?.[LANGUAGES[language]?.label]
  return typeof snippet === 'string' ? snippet : snippet?.code || LANGUAGES[language].starter
}

function getRunnableCode(problem, language) {
  const code = getStarterCode(problem, language)
  if (language === 'cpp' && !/\bmain\s*\(/.test(code)) return LANGUAGES.cpp.starter
  if (language === 'java' && !/\bstatic\s+void\s+main\s*\(/.test(code)) return LANGUAGES.java.starter
  return code
}

function getLanguageCode(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'python' || normalized === 'python3') return 'python'
  if (normalized === 'javascript' || normalized === 'js') return 'javascript'
  if (normalized === 'c++' || normalized === 'cpp') return 'cpp'
  if (normalized === 'java') return 'java'
  return normalized
}

function getSolutionForLanguage(solutions, language) {
  if (!solutions || typeof solutions !== 'object') return null
  const entry = Object.entries(solutions).find(([key]) => getLanguageCode(key) === language)
  if (!entry) return null
  const solution = entry[1]
  return typeof solution === 'string' ? solution : solution?.code || JSON.stringify(solution, null, 2)
}

function getSolutionLanguageOptions(solutions) {
  if (!solutions || typeof solutions !== 'object') return []
  return Object.entries(solutions).map(([key]) => ({
    value: getLanguageCode(key),
    label: key,
    code: typeof solutions[key] === 'string' ? solutions[key] : solutions[key]?.code || JSON.stringify(solutions[key], null, 2)
  })).filter(option => option.code?.trim())
}

function formatExecutionResult(result) {
  if (result.compile_output) {
    const detail = result.compile_output
    const hint = /undefined reference to [`']main|does not contain a main method/i.test(detail)
      ? '\n\nThis solution is a platform function/class, not a standalone program. Use the runnable template in the editor and add input/output code in main.'
      : ''
    return `Compile error:\n${detail}${hint}`
  }
  if (result.stderr) return `Error:\n${result.stderr}`
  if (result.stdout) return result.stdout
  return result.status?.description || 'The program finished without output.'
}

function CodeRunner({ problem = null, onLanguageChange }) {
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(() => getRunnableCode(problem, 'python'))
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  const changeLanguage = value => {
    setLanguage(value)
    onLanguageChange?.(value)
    setCode(getRunnableCode(problem, value))
    setOutput('')
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('Running code…')
    try {
      const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_id: LANGUAGES[language].id, source_code: code, stdin: input })
      })
      if (!response.ok) throw new Error(`Compiler service returned HTTP ${response.status}.`)
      const result = await response.json()
      setOutput(formatExecutionResult(result))
    } catch (error) {
      setOutput(`Could not run code: ${error.message || 'the compiler service is unavailable.'}`)
    } finally {
      setRunning(false)
    }
  }

  return <div className="code-runner">
    <div className="runner-toolbar">
      <select aria-label="Programming language" value={language} onChange={e => changeLanguage(e.target.value)}>
        {Object.entries(LANGUAGES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
      </select>
      <button className="primary-button" onClick={runCode} disabled={running}>{running ? 'Running…' : 'Run code'} <Code2 size={14}/></button>
    </div>
    <textarea className="code-editor" aria-label="Code editor" value={code} onChange={e => setCode(e.target.value)} spellCheck="false" />
    <label className="input-label">STANDARD INPUT<textarea className="runner-input" aria-label="Standard input" value={input} onChange={e => setInput(e.target.value)} placeholder="Optional input…" spellCheck="false" /></label>
    <pre className="runner-output" aria-live="polite">{output || 'Output will appear here.'}</pre>
    <small className="runner-note">Execution is provided by Judge0 CE. Do not run secrets or untrusted private code.</small>
  </div>
}

function App() {
  const [page, setPage] = useState(() => window.location.hash === '#dashboard' ? 'dashboard' : window.location.hash === '#developer' ? 'developer' : window.location.hash === '#request' ? 'request' : 'home')
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
  const [catalogPage, setCatalogPage] = useState(1)
  const [solved, setSolved] = useState(() => readStoredList('aa-solved'))
  const [bookmarks, setBookmarks] = useState(() => readStoredList('aa-bookmarks'))
  const [dark, setDark] = useState(() => getStoredValue('aa-theme', 'dark') !== 'light')
  const [showFilters, setShowFilters] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [requestType, setRequestType] = useState('Feature request')
  const [requestName, setRequestName] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [requestStatus, setRequestStatus] = useState('')
  const modalRef = useRef(null)
  const [solutionLanguage, setSolutionLanguage] = useState('python')

  useEffect(() => { setStoredValue('aa-solved', JSON.stringify(solved)) }, [solved])
  useEffect(() => { setStoredValue('aa-bookmarks', JSON.stringify(bookmarks)) }, [bookmarks])
  useEffect(() => { setStoredValue('aa-theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => {
    let frame = 0
    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        setScrollProgress(scrollable > 0 ? Math.min(100, Math.round(window.scrollY / scrollable * 100)) : 0)
        setShowBackToTop(window.scrollY > 400)
        frame = 0
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])
  useEffect(() => {
    const handleHashChange = () => setPage(window.location.hash === '#dashboard' ? 'dashboard' : window.location.hash === '#developer' ? 'developer' : window.location.hash === '#request' ? 'request' : 'home')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])
  useEffect(() => {
    if (!selected) return undefined
    if (modalRef.current) modalRef.current.scrollTop = 0
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = event => event.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [selected])
  useEffect(() => {
    const source = selected?.solutions && Object.keys(selected.solutions).length > 0 ? selected.solutions : selected?.snippets
    const options = getSolutionLanguageOptions(source)
    const preferred = options.find(option => option.value === 'python') || options[0]
    setSolutionLanguage(preferred?.value || 'python')
  }, [selected?.id])

  async function loadCatalog() {
    setLoading(true); setError('')
    let curatedRecords = []
    try {
      const [curatedRes, localRes] = await Promise.all([fetch(CURATED_URL), fetch(LOCAL_URL)])
      if (curatedRes.ok) {
        const c = await curatedRes.json()
        curatedRecords = (c.problems || []).map(curatedNormalize)
        setCurated(curatedRecords)
      }
      let response = localRes
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
  const solvedSet = useMemo(() => new Set(solved), [solved])
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(p => {
      const text = [p.title, p.id, p.slug, ...(p.topics || []), p.description].join(' ').toLowerCase()
      return (!q || text.includes(q)) &&
        (difficulty === 'All' || p.difficulty.toLowerCase() === difficulty.toLowerCase()) &&
        (topic === 'All' || p.topics.some(t => t.toLowerCase() === topic.toLowerCase())) &&
        (status === 'All' || (status === 'Solved' ? solvedSet.has(String(p.id)) : status === 'Bookmarked' ? bookmarkSet.has(String(p.id)) : !solvedSet.has(String(p.id)))) &&
        (premium === 'All' || (premium === 'Free' ? !p.premium : p.premium))
    })
  }, [all, query, difficulty, topic, status, premium, solvedSet, bookmarkSet])
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const paginated = useMemo(() => visible.slice((catalogPage - 1) * pageSize, catalogPage * pageSize), [visible, catalogPage])
  const pageNumbers = useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
    const numbers = new Set([1, pageCount, catalogPage - 1, catalogPage, catalogPage + 1])
    return [...numbers].filter(number => number > 0 && number <= pageCount).sort((a, b) => a - b).reduce((items, number, index, values) => {
      if (index > 0 && number - values[index - 1] > 1) items.push(`ellipsis-${number}`)
      items.push(number)
      return items
    }, [])
  }, [pageCount, catalogPage])
  useEffect(() => {
    setCatalogPage(current => Math.min(current, pageCount))
  }, [pageCount])
  useEffect(() => {
    setCatalogPage(1)
  }, [query, difficulty, topic, status, premium])

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
    <div className="scroll-progress" style={{ '--scroll-progress': `${scrollProgress}%` }} role="progressbar" aria-label="Page scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={scrollProgress} />
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">&gt;_</span><span>LEET<span className="brand-accent">UNLOCK</span><small>THE CODING WORKSPACE</small></span></a>
        <nav><a className={page === 'home' ? 'nav-active' : ''} href="#home">Home</a><a className={page === 'dashboard' ? 'nav-active' : ''} href="#dashboard">EDU</a><a className={page === 'developer' ? 'nav-active' : ''} href="#developer">Developer</a><a className={page === 'request' ? 'nav-active' : ''} href="#request">Request</a><a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer">LeetCode <ExternalLink size={13}/></a><a className="sponsor-link" href="https://github.com/sponsors/amitpatle" target="_blank" rel="noreferrer"><Heart size={13}/> Sponsor</a></nav>
      <div className="top-actions"><button className="icon-button" title="Export progress" onClick={exportProgress}><Download size={17}/></button><button className="icon-button" title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button></div>
    </header>
    <main>
      {page === 'home' && <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> YOUR INTERVIEW PREP WORKSPACE</div><h1>Unlock your next<br/><span>breakthrough.</span></h1><p>A focused command center for coding practice. Search by concept, filter by difficulty, and turn every problem into progress.</p><div className="hero-meta"><span><Database size={13}/>{loading ? 'Loading catalog…' : `${stats.total.toLocaleString()} problems indexed`}</span><span className="dot-sep">·</span><span>{loading ? 'Preparing learning records…' : `${stats.total.toLocaleString()} learning records`}</span></div></div>
        <div className="hero-art" aria-hidden="true"><img src="/leetunlock-preview.svg" alt="" /></div>
      </section>}
      {page === 'dashboard' && <div className="dashboard-heading"><div className="eyebrow">EDU WORKSPACE</div><h1>Practice with purpose.</h1><p>Track progress, run code, and learn from every problem in one place.</p></div>}
      {page === 'developer' && <div className="dashboard-heading"><div className="eyebrow">THE BUILDER</div><h1>Open source by design.</h1><p>Meet the developer behind LeetUnlock and explore the project.</p></div>}
      {page === 'dashboard' && <section id="progress" className="stats-grid">
        <div className="stat-card"><span className="stat-label">TOTAL PROBLEMS</span><strong>{loading ? '—' : stats.total.toLocaleString()}</strong><small>Across all topics</small></div>
        <div className="stat-card"><span className="stat-label">EASY</span><strong className="easy-text">{stats.easy.toLocaleString()}</strong><small>Build your base</small></div>
        <div className="stat-card"><span className="stat-label">MEDIUM</span><strong className="medium-text">{stats.medium.toLocaleString()}</strong><small>Sharpen patterns</small></div>
        <div className="stat-card"><span className="stat-label">HARD</span><strong className="hard-text">{stats.hard.toLocaleString()}</strong><small>Master the edge</small></div>
        <div className="stat-card progress-stat"><span className="stat-label">YOUR PROGRESS</span><strong>{stats.done}<em> / {stats.total || '—'}</em></strong><div className="progress-track"><span style={{width: `${stats.total ? Math.min(100, stats.done / stats.total * 100) : 0}%`}}/></div><small>{stats.total ? Math.round(stats.done / stats.total * 100) : 0}% completed</small></div>
      </section>}
      {page === 'dashboard' && <section className="dsa-roadmap">
        <div className="section-heading"><div><div className="eyebrow">THE ROADMAP</div><h2>How to learn DSA</h2></div></div>
        <p className="practice-intro">Learn one pattern at a time, solve deliberately, and revisit problems until the ideas become instinct.</p>
        <div className="roadmap-grid">
          <article className="roadmap-card"><span className="roadmap-number">01</span><h3>Build the foundations</h3><p>Start with complexity analysis, arrays, strings, linked lists, stacks, queues, and hash tables.</p><span className="roadmap-focus">BIG-O · DATA STRUCTURES</span></article>
          <article className="roadmap-card"><span className="roadmap-number">02</span><h3>Master core patterns</h3><p>Practice two pointers, sliding window, prefix sums, binary search, sorting, and recursion.</p><span className="roadmap-focus">PATTERNS · PROBLEM SOLVING</span></article>
          <article className="roadmap-card"><span className="roadmap-number">03</span><h3>Grow your toolkit</h3><p>Move to trees, heaps, graphs, backtracking, greedy algorithms, and dynamic programming.</p><span className="roadmap-focus">TREES · GRAPHS · DP</span></article>
          <article className="roadmap-card"><span className="roadmap-number">04</span><h3>Prepare with intention</h3><p>Mix timed practice with review. Explain your trade-offs, track weak topics, and repeat missed problems.</p><span className="roadmap-focus">MOCKS · REVIEW · CONSISTENCY</span></article>
        </div>
        <div className="study-rhythm"><strong>A simple daily rhythm</strong><span>10 min review</span><span>40 min focused solving</span><span>10 min write-up</span><span>1 revisit later</span></div>
      </section>}
      {page === 'dashboard' && <section className="library-section">
        <div className="section-heading"><div><div className="eyebrow">THE LIBRARY</div><h2>DSA learning library</h2></div></div>
        <p className="practice-intro">A free path from fundamentals to advanced interview patterns. Learn the idea, implement it, and solve a small set of focused problems.</p>
        <div className="library-grid">{DSA_LIBRARY.map(item => <article className="library-card" key={item.topic}>
          <h3>{item.topic}</h3>
          <div><strong>How to learn it</strong><p>{item.learn}</p></div>
          <div><strong>Where to learn it</strong><ul>{item.resources.map(([name, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{name} <ExternalLink size={11}/></a></li>)}</ul></div>
        </article>)}</div>
      </section>}
      {page === 'home' && <section id="catalog" className="catalog-section">
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
          {paginated.map(p => <article className="problem-row" key={`${p.id}-${p.slug}`} onClick={() => setSelected(p)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelected(p)}>
            <div className="problem-main"><span className="problem-id">{p.id.padStart ? `#${p.id}` : p.id}</span><div className="problem-name"><strong>{p.title}</strong><small>{p.premium ? 'PREMIUM' : p.hasCurated || curatedById.has(String(p.id)) ? 'CURATED NOTES AVAILABLE' : p.slug || 'PROBLEM'}</small></div></div>
            <div className="topic-list">{(p.topics || []).slice(0, 2).map(t => <span className="topic-chip" key={t}>{t}</span>)}{(p.topics || []).length > 2 && <span className="topic-more">+{p.topics.length - 2}</span>}</div>
            <div><span className={`difficulty diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></div>
            <div className="row-status"><button title={solved.includes(String(p.id)) ? 'Mark unsolved' : 'Mark solved'} className={`row-action ${solved.includes(String(p.id)) ? 'is-done' : ''}`} onClick={e => { e.stopPropagation(); toggle(solved, setSolved, p.id) }}><CheckCircle2 size={17}/></button><button title={bookmarks.includes(String(p.id)) ? 'Remove bookmark' : 'Bookmark'} className={`row-action ${bookmarks.includes(String(p.id)) ? 'is-bookmarked' : ''}`} onClick={e => { e.stopPropagation(); toggle(bookmarks, setBookmarks, p.id) }}><Bookmark size={16}/></button><ChevronRight size={16} className="row-chevron"/></div>
          </article>)}
          <div className="pagination" aria-label="Catalog pagination">
            <button className="pagination-button" disabled={catalogPage === 1} onClick={() => setCatalogPage(current => current - 1)}>Previous</button>
            <div className="page-number-list">{pageNumbers.map(number => typeof number === 'string' ? <span className="pagination-ellipsis" key={number}>…</span> : <button key={number} className={`pagination-button page-number ${catalogPage === number ? 'is-current' : ''}`} aria-label={`Page ${number}`} aria-current={catalogPage === number ? 'page' : undefined} onClick={() => setCatalogPage(number)}>{number}</button>)}</div>
            <button className="pagination-button" disabled={catalogPage === pageCount} onClick={() => setCatalogPage(current => current + 1)}>Next</button>
          </div>
        </div>}
        <div className="catalog-footer"><span>LEETUNLOCK / INDEX V1.0</span><span>Progress stored locally on this device</span></div>
      </section>}
      {page === 'dashboard' && <section id="practice" className="practice-section">
        <div className="section-heading"><div><div className="eyebrow">THE PLAYGROUND</div><h2>Practice code</h2></div></div>
        <p className="practice-intro">Write and run Python, JavaScript, C++, or Java in your browser.</p>
        <CodeRunner />
      </section>}
      {page === 'developer' && <section id="developer" className="developer-section">
        <div className="section-heading"><div><div className="eyebrow">THE BUILDER</div><h2>Developer</h2></div></div>
        <div className="developer-card">
          <img className="developer-avatar" src={DEVELOPER.avatar} alt={`${DEVELOPER.name} GitHub avatar`} />
          <div className="developer-copy">
            <span className="developer-role">OPEN SOURCE DEV</span>
            <h3>{DEVELOPER.name}</h3>
            <p>{DEVELOPER.bio}</p>
            <div className="developer-stats"><span><strong>{DEVELOPER.publicRepos}</strong> public repos</span><span><strong>{DEVELOPER.followers}</strong> followers</span><span>@{DEVELOPER.username}</span></div>
            <div className="developer-links">
              <a className="primary-button" href={DEVELOPER.profileUrl} target="_blank" rel="noreferrer">GitHub profile <ExternalLink size={14}/></a>
              <a className="secondary-button" href={DEVELOPER.repositoryUrl} target="_blank" rel="noreferrer">LEETUNLOCK repository <ExternalLink size={14}/></a>
            </div>
          </div>
        </div>
      </section>}
      {page === 'request' && <section className="request-section">
        <div className="dashboard-heading"><div className="eyebrow">CONTACT THE BUILDER</div><h1>Request or report.</h1><p>Share an idea, ask for an improvement, or report a problem directly by email.</p></div>
        <div className="request-card">
          <div className="request-card-heading"><Mail size={20}/><div><h2>Send a message</h2><p>Your message will be delivered to Amit through the configured mail API.</p></div></div>
          <form onSubmit={async e => { e.preventDefault(); setRequestStatus('Sending…'); try { const response = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: requestType, name: requestName, email: requestEmail, message: requestMessage }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to send the message.'); setRequestStatus('Message sent successfully.'); setRequestMessage(''); } catch (error) { setRequestStatus(error.message || 'Unable to send the message.'); } }}>
            <label>TYPE<select value={requestType} onChange={e => setRequestType(e.target.value)}><option>Feature request</option><option>Bug report</option><option>Content correction</option><option>General message</option></select></label>
            <div className="request-fields"><label>YOUR NAME<input value={requestName} onChange={e => setRequestName(e.target.value)} placeholder="Your name" /></label><label>YOUR EMAIL<input type="email" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} placeholder="you@example.com" /></label></div>
            <label>MESSAGE<textarea required value={requestMessage} onChange={e => setRequestMessage(e.target.value)} placeholder="Tell me what you would like to request or report…" /></label>
            <button className="primary-button" type="submit" disabled={requestStatus === 'Sending…'}>{requestStatus === 'Sending…' ? 'Sending…' : 'Send message'} <Mail size={14}/></button>
          </form>
          {requestStatus && <p className="request-status" aria-live="polite">{requestStatus}</p>}
          <p className="request-address">Messages are delivered privately through the configured mail service.</p>
        </div>
      </section>}
    </main>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section ref={modalRef} className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="problem-title" onClick={e => e.stopPropagation()}>
      <div className="modal-header"><div className="modal-top"><span className="eyebrow">PROBLEM DETAIL / #{selected.id}</span><button className="icon-button" aria-label="Close problem details" onClick={() => setSelected(null)}><X size={18}/></button></div>
      <h2 id="problem-title">{selected.title}</h2><div className="modal-meta"><span className={`difficulty diff-${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span>{selected.premium && <span className="topic-chip">Premium</span>}{(selected.topics || []).map(t => <span className="topic-chip" key={t}>{t}</span>)}</div></div>
      <div className="modal-actions"><button className={solved.includes(String(selected.id)) ? 'primary-button done-button' : 'primary-button'} onClick={() => toggle(solved, setSolved, selected.id)}><CheckCircle2 size={16}/>{solved.includes(String(selected.id)) ? 'Solved' : 'Mark as solved'}</button><button className="secondary-button" onClick={() => toggle(bookmarks, setBookmarks, selected.id)}><Bookmark size={16}/>{bookmarks.includes(String(selected.id)) ? 'Bookmarked' : 'Bookmark'}</button><a className="secondary-button" href={selected.url} target="_blank" rel="noreferrer">Open on LeetCode <ExternalLink size={14}/></a></div>
      <div className="detail-layout"><aside className="modal-practice"><h3>Practice your solution</h3><CodeRunner problem={selected} onLanguageChange={setSolutionLanguage} /></aside><div className="detail-content">
        {selected.summary && <><h3>How to think</h3><p>{selected.summary}</p></>}
        {selected.description ? <><h3>Problem statement</h3><div className="statement" dangerouslySetInnerHTML={{__html: String(selected.description).startsWith('<') ? selected.description : String(selected.description).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/\r?\n/g, '<br/>')}} /></> : <div className="notice compact"><AlertCircle size={16}/>Full statement isn't included in this metadata record. Open the canonical problem page for the full prompt.</div>}
        {selected.examples?.length > 0 && <><h3>Examples</h3>{selected.examples.map((ex, i) => <pre className="example" key={i}>{formatExample(ex)}</pre>)}</>}
        {selected.constraints?.length > 0 && <><h3>Constraints</h3><ul>{selected.constraints.map((c, i) => <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>)}</ul></>}
        {selected.hints?.length > 0 && <><h3>Hints</h3><ol>{selected.hints.map((h, i) => <li key={i}>{typeof h === 'string' ? h : JSON.stringify(h)}</li>)}</ol></>}
        {selected.solutions && typeof selected.solutions === 'object' && Object.keys(selected.solutions).length > 0 && <><div className="solution-heading"><h3>Curated solution · {solutionLanguage}</h3><select aria-label="Solution language" value={solutionLanguage} onChange={e => setSolutionLanguage(e.target.value)}>{getSolutionLanguageOptions(selected.solutions).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>{getSolutionForLanguage(selected.solutions, solutionLanguage) ? <div className="code-block"><div className="code-title"><Code2 size={14}/>{solutionLanguage}</div><pre>{getSolutionForLanguage(selected.solutions, solutionLanguage)}</pre></div> : <div className="notice compact"><AlertCircle size={16}/>No curated solution is available in this language.</div>}</>}
        {(!selected.solutions || Object.keys(selected.solutions).length === 0) && selected.snippets && Object.keys(selected.snippets).length > 0 && <><div className="solution-heading"><h3>Starter template · {solutionLanguage}</h3><select aria-label="Template language" value={solutionLanguage} onChange={e => setSolutionLanguage(e.target.value)}>{getSolutionLanguageOptions(selected.snippets).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>{getSolutionForLanguage(selected.snippets, solutionLanguage) ? <div className="code-block"><div className="code-title"><Code2 size={14}/>{solutionLanguage}</div><pre>{getSolutionForLanguage(selected.snippets, solutionLanguage)}</pre></div> : <div className="notice compact"><AlertCircle size={16}/>No starter template is available in this language.</div>}</>}
        {(!selected.solutions || Object.keys(selected.solutions).length === 0) && (!selected.snippets || Object.keys(selected.snippets).length === 0) && <div className="notice compact"><AlertCircle size={16}/>No solution code was included in this catalog record. Use the practice editor above to write and run your own solution.</div>}
      </div></div>
    </section></div>}
    <footer className="site-footer">
      <div className="footer-brand"><span>&gt;_ LEETUNLOCK</span><small>Built for learning, not shortcuts.</small></div>
      <div className="footer-about"><strong>About me</strong><span>{DEVELOPER.name} — {DEVELOPER.bio}.</span><a href={DEVELOPER.profileUrl} target="_blank" rel="noreferrer">GitHub profile <ExternalLink size={12}/></a></div>
      <div className="footer-open-source"><strong>Open source</strong><span>Improve the workspace, share ideas, and help make interview prep more accessible.</span><a href="https://github.com/amitpatle/LEETUNLOCK" target="_blank" rel="noreferrer">View repository <ExternalLink size={12}/></a></div>
      <small>Problem content belongs to its respective owners.</small>
    </footer>
    {showBackToTop && <button className="back-to-top" aria-label="Back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18}/></button>}
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
