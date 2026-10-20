# LeetUnlock — direct project

A responsive React/Vite problem catalog with search, difficulty/topic filters, solved/bookmark tracking, dark/light mode, problem detail panels, local progress persistence, and JSON export.

## Start it

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Catalog data

- `public/data/curated-problems.json` contains 80 curated LeetUnlock learning records.
- On startup, the app first checks `public/data/problems.json`, then attempts to load the public dataset at:
  `https://raw.githubusercontent.com/neenza/leetcode-problems/main/merged_problems.json`
- The public dataset README describes a dataset of 2,913 free problems with fields including title, ID, difficulty, topics, description, examples, constraints, hints, starter snippets, and some editorial content. The actual remote count may change. This is **not a verified 3,600-record snapshot**.
- To download the current source dataset into the project for offline use, run:
  ```bash
  npm run import:catalog
  ```
  If the source blocks access or changes format, the script prints an error rather than fabricating data.
- If the online catalog is unavailable, the app still displays the curated records bundled with the project.

## Features

- Fuzzy-ish text search across titles, IDs, slugs, tags and descriptions
- Difficulty, topic, solved/bookmarked and free/premium filters
- Per-device solved and bookmark persistence using localStorage
- Progress export to JSON
- Responsive layout and dark/light themes
- Problem details, canonical LeetCode links, statement, examples, constraints, hints and starter snippets when the source provides them
- Curated learning content merged by problem ID when available

## Data note

LeetCode content and problem statements belong to their respective rights holders. The project links back to LeetCode and uses a public community dataset as an optional data source. Review that dataset's license and LeetCode's terms before redistributing fetched statements or editorial content.
