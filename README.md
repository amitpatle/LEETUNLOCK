# LeetUnlock — direct project

A responsive React/Vite problem catalog with search, difficulty/topic filters, solved/bookmark tracking, dark/light mode, problem detail panels, local progress persistence, and JSON export.

LeetUnlock is a monochrome coding workspace for exploring problems, tracking progress, and opening canonical LeetCode statements.

## Preview

![LeetUnlock coding workspace](./public/leetunlock-preview.svg)

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To create a production build:

```bash
npm run build
npm run preview
```

## Import the catalog

The repository includes a catalog snapshot at `public/data/problems.json`, so the app works offline after installation. To fetch the latest catalog from the configured public source:

```bash
npm run import:catalog
npm run curate:catalog
```

The import script validates the response and writes the snapshot only when a recognizable problem list is returned. If the source is unavailable or changes format, it exits with an error.

## Catalog data

- `public/data/curated-problems.json` contains the 80 enriched learning records. All other catalog problems use the bundled catalog statement, metadata, examples, hints, constraints, and code without duplicating that large data in the curated file.
- On startup, the app first checks `public/data/problems.json`, then attempts to load the public dataset at:
  `https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json`
- The bundled snapshot currently contains 4,087 records, including the latest public metadata available when it was refreshed. The remote count may change when the catalog is refreshed.
- If both catalog sources are unavailable, the app still displays the curated records bundled with the project.

## Features

- Text search across titles, IDs, slugs, tags and descriptions
- Difficulty, topic, solved/bookmarked and free/premium filters
- Per-device solved and bookmark persistence using localStorage
- Progress export to JSON
- In-browser practice editor with Python, JavaScript, C++ and Java execution through Judge0 CE
- Responsive layout and dark/light themes
- Home catalog and EDU pages for separating discovery from practice
- Dashboard DSA roadmap and a free learning library with open resources
- Request tab for feature requests, bug reports, and content corrections by email
- Problem details, canonical LeetCode links, statement, examples, constraints, hints and starter snippets when the source provides them
- Curated learning content merged by problem ID when available

## Project structure

```text
src/main.jsx                 React application and catalog logic
src/style.css                Application styles and responsive layout
public/data/problems.json    Offline catalog snapshot
public/data/curated-problems.json
                             Curated learning records
scripts/import-catalog.mjs   Catalog import and validation script
scripts/build-curated.mjs    Generate records for all catalog problems
```

## Code execution

The Practice section and problem details include a code editor for Python, JavaScript, C++, and Java. Code is sent to the public Judge0 CE endpoint for execution, so network access is required and public-service rate limits may apply. Do not run secrets or private sensitive code.

## Developer

LeetUnlock is maintained by [A M i T](https://github.com/amitpatle), an open-source developer on GitHub. Their public profile bio is: “There is always one more bug to fix.” The profile currently lists 39 public repositories and 29 followers. Visit the [GitHub profile](https://github.com/amitpatle) or the [LEETUNLOCK repository](https://github.com/amitpatle/LEETUNLOCK).

## Requests and issue reports

Use the **Request** tab to send a feature request, bug report, content correction, or general message. Messages are routed privately by the server-side API using Resend, with `RESEND_API_KEY`, `MAIL_FROM`, and `CONTACT_EMAIL` configured as server-side environment variables. `MAIL_FROM` must be a sender address or domain verified with Resend; never put these values in frontend code.

## Library

The Dashboard includes a free DSA learning library covering complexity, arrays, strings, hashing, linked lists, stacks, queues, sorting, searching, trees, heaps, graphs, recursion, backtracking, greedy algorithms, and dynamic programming. Each topic includes a practical learning method and links to free resources such as [MIT OpenCourseWare](https://ocw.mit.edu/), [CS50](https://cs50.harvard.edu/x/), [freeCodeCamp](https://www.freecodecamp.org/learn/), [VisuAlgo](https://visualgo.net/en), [OpenDSA](https://opendsa-server.cs.vt.edu/), [Khan Academy](https://www.khanacademy.org/computing/computer-science/algorithms), and [cp-algorithms](https://cp-algorithms.com/).

## Data note

LeetCode content and problem statements belong to their respective rights holders. The project links back to LeetCode and uses a public community dataset as an optional data source. Review that dataset's license and LeetCode's terms before redistributing fetched statements or editorial content.
