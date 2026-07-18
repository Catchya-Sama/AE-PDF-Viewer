# Development Roadmap — PDF Viewer Extension

## Overview

| Phase | Name | Status | Goal |
|-------|------|--------|------|
| 0 | Research | ✅ Done | Inspirasi, blueprint, arsitektur, referensi |
| 1 | Project Initialization | ✅ Done | Project bisa di-build & jalan di AE |
| 2 | UI Prototype | ⬜ | 100% visual, 0% function |
| 3 | Core Architecture | ⬜ | Pondasi modular (Core, Storage, Theme, dll) |
| 4 | PDF Engine | ⬜ | Open, render, zoom, search, thumbnail |
| 5 | After Effects Bridge | ⬜ | CSInterface + ExtendScript integration |
| 6 | Storage | ⬜ | Recent files, bookmarks, favorites |
| 7 | Settings | ⬜ | Theme, language, zoom default |
| 8 | Optimization | ⬜ | Cache, lazy load, memory, performance |
| 9 | Packaging | ⬜ | ZXP package, install, testing |

---

## Phase 0 — Research ✅

- ✔ Inspirasi UI: `com.motionfun.noted`
- ✔ Blueprint struktur
- ✔ Arsitektur CEP 9 (AE 2020)
- ✔ Referensi manifest, .debug, CSInterface

---

## Phase 1 — Project Initialization ✅

**Goal:**
- ✔ Project berhasil dibuat
- ✔ React berjalan
- ✔ CEP berjalan
- ✔ Bisa Build

**Tasks:**
- [x] 001 — Scaffold project (folders)
- [x] 001 — package.json
- [x] 001 — tsconfig.json + tsconfig.node.json
- [x] 002 — index.html (root)
- [x] 003 — CSXS/manifest.xml (CSXS 9.0, AEFT [17.0,99.0])
- [x] 004 — .debug + mimetype + CSInterface.js + polyfills.js
- [x] 005 — vite.config.ts (base, chrome57 target)
- [x] 006 — jsx/host.jsx
- [x] 007 — src/main.tsx + App.tsx + global.css
- [x] 008 — scripts/copy-cep.mjs
- [x] 009 — README.md + docs/PHASE.md
- [x] 010 — npm install + build + test ✅

---

## Phase 2 — UI Prototype ⬜

**Goal:**
- ✔ UI selesai
- ✔ Responsive
- ✔ Theme
- ✔ Animation

**Tasks:**
- [ ] 011 — Header (logo + title + window controls)
- [ ] 012 — Sidebar (thumbnails list — dummy)
- [ ] 013 — Toolbar (Open, Zoom, Search, Page nav — dummy)
- [ ] 014 — Workspace (canvas area — empty state)
- [ ] 015 — Footer (page info, status)
- [ ] 016 — Theme system (dark/light CSS variables)
- [ ] 017 — Responsive layout + animation transitions

---

## Phase 3 — Core Architecture ⬜

**Goal:**
- ✔ Core selesai
- ✔ Tidak ada business logic di UI
- ✔ Semua module reusable

**Modules:**
- Core
- Storage
- Theme
- Config
- Logger
- Bridge
- Settings
- EventBus

---

## Phase 4 — PDF Engine ⬜

**Goal:**
- ✔ PDF bisa dibuka
- ✔ Zoom
- ✔ Search
- ✔ Thumbnail

**Flow:**
```
Open PDF → Render → Thumbnail → Zoom → Search
```

**Library:** pdf.js v2.x (kompatibel Chromium 57 / CEP 9)

---

## Phase 5 — After Effects Bridge ⬜

**Goal:**
- ✔ Open Project
- ✔ Remember PDF
- ✔ Restore Session

**Flow:**
```
Open Project → Remember PDF → Restore Session
```

**Tech:** CSInterface + ExtendScript

---

## Phase 6 — Storage ⬜

**Features:**
- Recent Files
- Bookmark
- Favorite
- Last Page
- Recent Folder

---

## Phase 7 — Settings ⬜

**Options:**
- Dark Theme
- Light Theme
- Language
- Zoom Default
- Thumbnail Width
- Animation Speed

---

## Phase 8 — Optimization ⬜

**Focus:**
- ✔ Cache
- ✔ Lazy Load
- ✔ Memory
- ✔ Resize
- ✔ Performance

---

## Phase 9 — Packaging ⬜

**Flow:**
```
vite build → ZXP Package → Install → Testing