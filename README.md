# PDF Viewer for Adobe After Effects

> A modern Adobe After Effects CEP Extension designed to keep all creative references inside your workspace.

---

## Overview

**PDF Viewer** is a stable CEP (Common Extensibility Platform) extension for Adobe After Effects that provides an integrated PDF reference environment directly inside the application.

Instead of constantly switching between Adobe After Effects, PDF readers, file explorers, browsers, and note-taking applications, this extension brings all essential references into a single workspace.

It allows artists, motion designers, editors, and animators to open, search, read, and copy from PDF documents without leaving After Effects.

This project is built with scalability in mind. Rather than being a simple PDF viewer, it serves as the foundation for a complete reference ecosystem inside Adobe After Effects.

---

## Documentation

### v1.0.0 release documentation

| Document | Release summary |
|----------|-----------------|
| [Changelog](docs/CHANGELOG.md) | Features, improvements, and fixes included in v1.0.0 |
| [Phase Tracker](docs/PHASE.md) | Completion details for development phases 0–9 |
| [Roadmap](docs/ROADMAP.md) | Stable-release status and completed project milestones |
| [Windows Installation](docs/INSTALL-WINDOWS.md) | ZXP/ZIP installation, checksum verification, known limitations, and uninstall steps |

### Additional project documentation

| Document | Description |
|----------|-------------|
| [Project Vision](docs/PROJECT_VISION.md) | Vision, philosophy, and core principles |
| [Architecture](docs/ARCHITECTURE.md) | Tech stack & system design |
| [UI Blueprint](docs/UI_BLUEPRINT.md) | UI/UX design specifications |
| [Development Rules](docs/DEVELOPMENT_RULES.md) | Coding standards & conventions |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |

---

## Project Status

> ✅ Stable Release — v1.0.0

* ✅ Project initialization
* ✅ Repository structure
* ✅ Development environment
* ✅ CEP project configuration
* ✅ Responsive UI and themes
* ✅ PDF rendering, thumbnails, zoom, bookmarks, and session restore
* ✅ Search results with accurate page-canvas highlights
* ✅ Selectable PDF text and After Effects text-layer workflows
* ✅ ZIP and signed ZXP distribution

See [Roadmap](docs/ROADMAP.md) for full details.

---

## Technology Stack

* React
* TypeScript
* Vite
* CEP (Adobe Common Extensibility Platform)
* ExtendScript
* PDF.js 2.x

See [Architecture](docs/ARCHITECTURE.md) for full details.

---

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm
- Adobe After Effects 2020+

### Installation

For release users, use one of the packages in `release/v1.0.0`:

- `PDF-Viewer-v1.0.0.zxp` for installation with a ZXP installer.
- `PDF-Viewer-v1.0.0-Windows.zip` for manual CEP installation.

See the [Windows installation guide](docs/INSTALL-WINDOWS.md) for complete ZXP and ZIP instructions.

### Development installation

```bash
# Clone the repository
git clone https://github.com/Catchya-Sama/AE-PDF-Viewer.git
cd AE-PDF-Viewer

# Install dependencies
npm install

# Build the project
npm run build

# Copy to CEP extensions folder
npm run copy-cep
```

### Usage

1. Open After Effects
2. Go to `Window > Extensions > PDF Viewer`
3. Open a PDF and select text directly on the rendered page
4. Press `Ctrl+C` for normal system clipboard use
5. Use `To AE` to append the copied PDF text to exactly one selected AE text layer; one space is inserted only when the text boundaries need it
6. Use `Paste as Text Layer` to create a new default-styled text layer:
   - centered in the active composition
   - beginning at the current composition time
   - immediately above the topmost selected timeline layer, or at the top when none is selected
   - selected after creation and removable with one Undo

> After Effects 2020 can cache manual character-paste clipboard state when the
> text-editing caret is not active. The `To AE` and `Paste as Text Layer` actions
> use the ExtendScript host bridge and are the deterministic workflows inside AE.

For debugging, open `http://localhost:8088` in a browser.

---

## License

This project is released under the MIT License unless stated otherwise.