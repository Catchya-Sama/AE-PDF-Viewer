# Changelog

> All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

No changes yet.

---

## [1.0.0] — 2026-07-21

### Added
- Documentation structure (`docs/` folder)
- Project vision, roadmap, architecture, UI blueprint, development rules, changelog, contributing guide
- Lazy thumbnail rendering with a bounded per-document LRU cache
- Cancellable page-render sessions with stale-frame and stale-overlay protection
- Adaptive 2×/3×/4× text supersampling for small generic fallback fonts
- Cancellable search sessions with per-document page-text caching
- Selectable PDF text with explicit Windows Unicode clipboard synchronization
- `To AE` action to append PDF text to one selected After Effects text layer with a smart whitespace separator
- `Paste as Text Layer` action to create a centered text layer above the selected timeline layer at the current comp time
- Search highlights for all matches on the visible PDF page, with a stronger active-result highlight
- React + TypeScript + Vite project setup and CEP 9 manifest for After Effects 2020+
- ExtendScript host bridge, CSInterface integration, and CEP-compatible production build workflow
- Dark/light theme, responsive layout, recent files, bookmarks, preferences, and session restore

### Changed
- Debounced Fit/Width resize rendering to reduce unnecessary PDF.js work
- Search now yields between pages to keep CEP 9 responsive
- Page canvases are capped at 16 million backing pixels and released on cleanup
- After Effects text actions now live in a collapsible second toolbar row opened by a centered overlay tab

### Fixed
- Blurry small Courier fallback text in `pdfTeX` documents at Fit/Width zoom
- Old page overlays appearing after rapid navigation, zoom, resize, or document switch
- Obsolete search results completing after the query was replaced or closed
- Repeated PDF text copies leaving Windows clipboard on the first selection in CEP mixed-context mode
- Layar hitam: `crossorigin` attribute causes CORS check failure in CEP 9
- Module script error: `type="module"` causes strict MIME type checking failure
- `host.jsx` not loaded: missing `<ScriptPath>` in manifest
- `getHostInfo()` error: `JSON.stringify()` not available in ExtendScript (ES3)
- `aeCheck()` top-level call causing load failure
- `app.project.file` null reference when no project is open

---

## Changelog Categories

- `Added` — New features
- `Changed` — Changes in existing functionality
- `Deprecated` — Soon-to-be removed features
- `Removed` — Removed features
- `Fixed` — Bug fixes
- `Security` — Vulnerability fixes