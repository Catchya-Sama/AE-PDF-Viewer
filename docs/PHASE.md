# Development Roadmap — PDF Viewer Extension

## Overview

| Phase | Name | Status | Goal |
|-------|------|--------|------|
| 0 | Research | ✅ Done | Inspirasi, blueprint, arsitektur, referensi |
| 1 | Project Initialization | ✅ Done | Project bisa di-build & jalan di AE |
| 2 | UI Prototype | ✅ Done | UI panel responsif dan theme |
| 3 | Core Architecture | ✅ Done | Services, EventBus, Config, Storage |
| 4 | PDF Engine | ✅ Done | Open, render, zoom, search, thumbnail |
| 5 | After Effects Bridge | ✅ Done | CSInterface, file dialog, session restore |
| 6 | Storage | ✅ Done | Recent files, bookmarks, preferences |
| 7 | Settings | ✅ Done | Theme, viewer behavior, sidebar |
| 8 | Optimization | 🚧 Next | Cache, lazy load, memory, performance |
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

## Phase 2 — UI Prototype ✅

**Goal:**
- ✔ UI selesai
- ✔ Responsive
- ✔ Theme
- ✔ Animation

**Tasks:**
- [x] 011 — Header and panel controls
- [x] 012 — Sidebar thumbnails + hide/show
- [x] 013 — Functional toolbar
- [x] 014 — Canvas workspace and empty state
- [x] 015 — Footer status
- [x] 016 — Persistent dark/light theme
- [x] 017 — Responsive layout

---

## Phase 3 — Core Architecture ✅

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

## Phase 4 — PDF Engine ✅

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

## Phase 5 — After Effects Bridge ✅

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

## Phase 6 — Storage ✅

**Features:**
- Recent Files
- Bookmark
- Last Page
- Zoom and viewer session
- Sidebar visibility

---

## Phase 7 — Settings ✅

**Options:**
- Theme
- Restore last session
- Zoom step
- Sidebar width
- Reset preferences

---

## Phase 8 — Optimization 🚧

**Focus:**
- [ ] Thumbnail lazy rendering
- [ ] Thumbnail cache
- [ ] PDF render cancellation and cleanup
- [ ] Memory profiling
- [ ] Performance regression testing

---

## Phase 9 — Packaging ⬜

**Flow:**
```
vite build → ZXP Package → Install → Testing
```