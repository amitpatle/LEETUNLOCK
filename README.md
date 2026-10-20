
# `LEETUNLOCK` —  LEET CODE UNLOCKED

<p align="center">
  <strong>FIND THE PROBLEM. DECODE THE LOGIC. UNLOCK THE SOLUTION.</strong>
  <br />
  <sub>A minimalist workspace for LeetCode problems and algorithmic problem-solving.</sub>
</p>

<p align="center">
  <a href="https://leetunlock.devs.li">
    <img src="https://img.shields.io/badge/↗_LAUNCH_LEETUNLOCK-000000?style=for-the-badge&labelColor=000000" alt="Launch LeetUnlock" />
  </a>
  <br /><br />
  <a href="https://github.com/amitpatle/LEETUNLOCK">SOURCE CODE</a>
  &nbsp; · &nbsp;
  <a href="https://github.com/amitpatle/LEETUNLOCK/issues">REPORT AN ISSUE</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REACT-000000?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/VITE-000000?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JAVASCRIPT-000000?style=flat-square&logo=javascript&logoColor=white" alt="JavaScript" />
  <img src="https://img.shields.io/badge/OPEN_SOURCE-000000?style=flat-square&logo=github&logoColor=white" alt="Open source" />
</p>

---

<p align="center">
  <img src="./public/leetunlock-preview.svg" alt="LeetUnlock — monochrome coding workspace" width="100%" />
</p>

## `01 / SYSTEM OVERVIEW`

LeetUnlock is a searchable LeetCode problem catalog and coding workspace built to make algorithm practice faster and more organized.

Discover thousands of coding challenges, navigate by topic and difficulty, explore available curated solutions, and practice your own implementations—all through a clean, monochrome interface.

```text
> INITIALIZING LEETUNLOCK...
> INDEXING PROBLEM CATALOG...
> LOADING SOLUTION RESOURCES...
> SYSTEM READY.
```

**Less searching. More solving.**

## `02 / CORE SYSTEMS`

<table>
<tr>
<td width="50%" valign="top">

### 01 — PROBLEM INDEX

- Search titles, IDs, slugs, tags, and descriptions
- Filter by difficulty and topic
- Filter solved and bookmarked problems
- Filter free and premium problems
- Open original LeetCode problem pages

</td>
<td width="50%" valign="top">

### 02 — SOLUTION EXPLORER

- Access curated solution code where available
- Explore statements, examples, and constraints
- Review hints and starter templates when provided
- Navigate to canonical LeetCode references
- Use problem details to guide your approach

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 03 — CODE LAB

- In-browser coding editor
- Python, JavaScript, C++, and Java
- Remote execution through Judge0 CE
- Experiment with your own implementations
- Practice without leaving the workspace

</td>
<td width="50%" valign="top">

### 04 — PROGRESS ENGINE

- Mark problems as solved
- Bookmark challenges for later
- Persist progress with browser localStorage
- Export progress as JSON
- Switch between dark and light themes

</td>
</tr>
</table>

### ADDITIONAL MODULES

- **EDU:** DSA roadmap and topic-based learning library
- **RESOURCE INDEX:** links to free educational material
- **REQUEST PORT:** feature requests, bug reports, and content corrections
- **RESPONSIVE INTERFACE:** layouts for desktop and mobile

> **Solution coverage:** The curated dataset contains 80 enriched learning records. Complete solution code is available only for selected curated problems. Other records may provide problem statements, metadata, examples, hints, constraints, or starter templates.

## `03 / CATALOG ENGINE`

The application uses a bundled catalog with optional remote data loading.

| RESOURCE | FUNCTION |
|---|---|
| `public/data/problems.json` | Offline problem catalog |
| `public/data/curated-problems.json` | Enriched learning records |
| `scripts/import-catalog.mjs` | Import and validate catalog data |
| `scripts/build-curated.mjs` | Generate curated records |

The bundled snapshot currently contains **4,087 records**. The total may change when refreshed.

The application checks its local catalog first and then attempts to load the configured public dataset:

[`merged_problems.json`](https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json)

If both sources are unavailable, the app can still display its bundled curated records.

### Refresh catalog data

```bash
npm run import:catalog
npm run curate:catalog
```

The import script validates the response before writing the catalog and exits with an error if the source is unavailable or its format is unrecognized.

## `04 / LOCAL DEPLOYMENT`

**Requirements:** Node.js 18+ and npm.

### Initialize

```bash
git clone https://github.com/amitpatle/LEETUNLOCK.git
cd LEETUNLOCK
npm install
npm run dev
```

Open the local URL printed by Vite.

### Production build

```bash
npm run build
npm run preview
```

## `05 / ARCHITECTURE`

```text
LEETUNLOCK/
├── src/
│   ├── main.jsx
│   └── style.css
├── public/
│   ├── data/
│   │   ├── problems.json
│   │   └── curated-problems.json
│   └── leetunlock-preview.svg
├── scripts/
│   ├── import-catalog.mjs
│   └── build-curated.mjs
└── README.md
```

## `06 / TECHNOLOGY STACK`

| TECHNOLOGY | PURPOSE |
|---|---|
| React | User interface |
| Vite | Development server and production builds |
| JavaScript | Application logic |
| JSON | Catalog and curated data |
| localStorage | Local progress persistence |
| Judge0 CE | Remote code execution |
| Resend | Server-side contact email delivery |

## `07 / EXECUTION & SECURITY`

The Practice section and problem details provide an editor for Python, JavaScript, C++, and Java.

Code execution sends submitted code to the public Judge0 CE endpoint. An internet connection is required, and public-service availability and rate limits may apply.

**Security protocol**

- Do not submit passwords, credentials, API keys, or sensitive private code to a public execution service.
- Keep email credentials on the server.
- Never expose secrets in frontend code or commit them to the repository.

## `08 / REQUEST PORT`

Use the website's **Request** tab to submit:

- Feature requests
- Bug reports
- Problem-content corrections
- General feedback

The server-side API uses Resend to route messages privately.

Configure these server-side environment variables:

```text
RESEND_API_KEY
MAIL_FROM
CONTACT_EMAIL
```

`MAIL_FROM` must use a sender address or domain verified with Resend.

## `09 / KNOWLEDGE LIBRARY`

Explore DSA concepts across:

`COMPLEXITY` · `ARRAYS` · `STRINGS` · `HASHING` · `LINKED LISTS` · `STACKS` · `QUEUES` · `SORTING` · `SEARCHING` · `TREES` · `HEAPS` · `GRAPHS` · `RECURSION` · `BACKTRACKING` · `GREEDY` · `DYNAMIC PROGRAMMING`

### External learning resources

- [MIT OpenCourseWare](https://ocw.mit.edu/)
- [CS50](https://cs50.harvard.edu/x/)
- [freeCodeCamp](https://www.freecodecamp.org/learn/)
- [VisuAlgo](https://visualgo.net/en)
- [OpenDSA](https://opendsa-server.cs.vt.edu/)
- [Khan Academy](https://www.khanacademy.org/computing/computer-science/algorithms)
- [CP-Algorithms](https://cp-algorithms.com/)

## `10 / CONTRIBUTION PROTOCOL`

Contributions, corrections, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the application and production build.
5. Submit a pull request.

**Repository:** [amitpatle/LEETUNLOCK](https://github.com/amitpatle/LEETUNLOCK)

## `11 / DEVELOPER IDENTITY`

<p align="center">
  <strong>A M i T</strong>
  <br />
  <sub>OPEN-SOURCE DEVELOPER</sub>
  <br /><br />
  <a href="https://github.com/amitpatle">GITHUB ↗</a>
  &nbsp; · &nbsp;
  <a href="https://github.com/amitpatle/LEETUNLOCK">REPOSITORY ↗</a>
  &nbsp; · &nbsp;
  <a href="https://leetunlock.devs.li">LIVE WEBSITE ↗</a>
</p>

---

<p align="center">
  <strong>ONE PROBLEM. ONE APPROACH. ONE STEP FORWARD.</strong>
  <br /><br />
  <a href="https://leetunlock.devs.li">[ ACCESS LEETUNLOCK ↗ ]</a>
</p>

<sub>LeetUnlock is an independent educational project and is not affiliated with or endorsed by LeetCode. Problem statements, trademarks, and third-party datasets belong to their respective rights holders. Review applicable licenses and platform terms before redistributing third-party content.</sub>
