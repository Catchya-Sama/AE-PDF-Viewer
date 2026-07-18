# Changelog

> All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Documentation structure (`docs/` folder)
- Project vision, roadmap, architecture, UI blueprint, development rules, changelog, contributing guide

---

## [1.0.0] — 2026-07-19

### Added
- Project initialization (Phase 1)
- React + TypeScript + Vite setup
- CEP 9 manifest configuration (CSXS 9.0, AEFT [17.0,99.0])
- ExtendScript host bridge (`jsx/host.jsx`)
- CSInterface bridge with `ping()` and `getHostInfo()` functions
- Vite custom plugin for CEP 9 compatibility (remove `crossorigin`, fix `type="module"`)
- Build & deploy script (`scripts/copy-cep.mjs`)
- Dark theme global CSS
- Error fallback in `main.tsx`
- `.gitignore`, `README.md`, `docs/PHASE.md`

### Fixed
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