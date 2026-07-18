# Architecture

> System architecture, technology stack, and design decisions.

---

## Technology Stack

* **React** — UI library for building component-based interfaces
* **TypeScript** — Type-safe JavaScript for maintainable code
* **Vite** — Fast build tool and dev server
* **CEP** — Adobe Common Extensibility Platform (runtime)
* **ExtendScript** — Adobe's scripting language for host application communication
* **PDF.js** — PDF rendering engine (planned, Phase 4)
* **Tailwind CSS** — Utility-first CSS framework (planned)

---

## System Architecture

```text
Adobe After Effects
        │
        ▼
CEP Extension (.zxp)
        │
        ▼
React Application
        │
        ▼
Core Services
        │
        ▼
CSInterface Bridge
        │
        ▼
ExtendScript
        │
        ▼
Adobe After Effects API
```

---

## Layer Description

### 1. Adobe After Effects (Host)
The host application that runs the CEP extension. Provides the ExtendScript engine and Adobe APIs.

### 2. CEP Extension (.zxp)
The packaged extension loaded by Adobe. Contains:
- `CSXS/manifest.xml` — Extension configuration
- `index.html` — Entry point
- `assets/` — Built JS & CSS
- `jsx/host.jsx` — ExtendScript bridge

### 3. React Application
The UI layer. Built with React + TypeScript + Vite. Handles:
- Component rendering
- User interactions
- State management
- Theme system

### 4. Core Services
Planned modular services (Phase 3):
- **Event Bus** — Cross-module communication
- **Storage Manager** — Persistent data (recent files, bookmarks, preferences)
- **Theme Manager** — Dark/light theme switching
- **Configuration Manager** — User settings

### 5. CSInterface Bridge
The communication layer between React (web) and ExtendScript (host). Uses `CSInterface.evalScript()` to call ExtendScript functions.

### 6. ExtendScript
Adobe's scripting language (ES3-based). Runs in the host application's ExtendScript engine. Provides access to:
- `app.project` — Current AE project
- `app.comp` — Compositions
- `app.layer` — Layers
- File system access
- AE-specific APIs

---

## Planned Features

### PDF Workspace

* Open PDF documents
* Multi-page navigation
* Thumbnail sidebar
* Search inside PDF
* Zoom controls
* Fit page
* Fit width
* Recent documents
* Bookmarks
* Session restore

### Future Modules

This project is designed with a modular architecture, making it easy to expand in the future.

Planned modules include:

* Image Viewer
* Notes
* Bookmark Manager
* Asset Browser
* Font Preview
* Color Palette
* Reference Library

---

## CEP 9 Compatibility Notes

This project targets **CEP 9** (After Effects 2020, Chromium 57). Key compatibility considerations:

1. **No `type="module"`** — CEP 9 loads from `file://` protocol where strict MIME type checking fails. Use `type="text/javascript" defer` instead.

2. **No `crossorigin` attribute** — CORS check fails for local files. Custom Vite plugin removes this attribute.

3. **No `JSON` object in ExtendScript** — ExtendScript is ES3-based. Build JSON strings manually instead of using `JSON.stringify()`.

4. **`--allow-file-access`** — Required CEF command line parameter for file access.

5. **`--disable-web-security`** — Required for cross-origin requests in development.