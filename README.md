# LeetUnlock — direct project

A responsive React/Vite problem catalog with search, difficulty/topic filters, solved/bookmark tracking, dark/light mode, problem detail panels, local progress persistence, and JSON export.

LeetUnlock is a monochrome coding workspace for exploring problems, tracking progress, and opening canonical LeetCode statements.

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
```

The import script validates the response and writes the snapshot only when a recognizable problem list is returned. If the source is unavailable or changes format, it exits with an error.

## Catalog data

- `public/data/curated-problems.json` contains 80 curated LeetUnlock learning records.
- On startup, the app first checks `public/data/problems.json`, then attempts to load the public dataset at:
  `https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json`
- The bundled snapshot currently contains 2,913 records. The remote count may change when the catalog is refreshed.
- If both catalog sources are unavailable, the app still displays the curated records bundled with the project.

## Features

- Text search across titles, IDs, slugs, tags and descriptions
- Difficulty, topic, solved/bookmarked and free/premium filters
- Per-device solved and bookmark persistence using localStorage
- Progress export to JSON
- Responsive layout and dark/light themes
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
```

## Data note

LeetCode content and problem statements belong to their respective rights holders. The project links back to LeetCode and uses a public community dataset as an optional data source. Review that dataset's license and LeetCode's terms before redistributing fetched statements or editorial content.
