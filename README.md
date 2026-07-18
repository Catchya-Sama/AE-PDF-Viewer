# Adobe Reference Workspace

> A modern Adobe After Effects CEP Extension designed to keep all creative references inside your workspace.

---

## Overview

**Adobe Reference Workspace** is a modern CEP (Common Extensibility Platform) extension for Adobe After Effects that aims to provide an integrated reference environment directly inside the application.

Instead of constantly switching between Adobe After Effects, PDF readers, file explorers, browsers, and note-taking applications, this extension brings all essential references into a single workspace.

The first module under development is a **PDF Viewer**, allowing artists, motion designers, editors, and animators to open and read PDF documents without leaving After Effects.

This project is built with scalability in mind. Rather than being a simple PDF viewer, it serves as the foundation for a complete reference ecosystem inside Adobe After Effects.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Vision](docs/PROJECT_VISION.md) | Vision, philosophy, and core principles |
| [Roadmap](docs/ROADMAP.md) | Development phases & current status |
| [Architecture](docs/ARCHITECTURE.md) | Tech stack & system design |
| [UI Blueprint](docs/UI_BLUEPRINT.md) | UI/UX design specifications |
| [Development Rules](docs/DEVELOPMENT_RULES.md) | Coding standards & conventions |
| [Changelog](docs/CHANGELOG.md) | Version history & notable changes |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |
| [Phase Tracker](docs/PHASE.md) | Detailed phase progress tracking |

---

## Project Status

> 🚧 Early Development (Phase 1)

* ✅ Project initialization
* ✅ Repository structure
* ✅ Development environment
* ✅ CEP project configuration
* ⏳ UI Prototype
* ⏳ Core Architecture
* ⏳ PDF Rendering Engine
* ⏳ Adobe Bridge Integration

See [Roadmap](docs/ROADMAP.md) for full details.

---

## Technology Stack

* React
* TypeScript
* Vite
* CEP (Adobe Common Extensibility Platform)
* ExtendScript
* PDF.js (planned)
* Tailwind CSS (planned)

See [Architecture](docs/ARCHITECTURE.md) for full details.

---

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm
- Adobe After Effects 2020+

### Installation

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
3. For debugging, open `http://localhost:8088` in a browser

---

## License

This project is released under the MIT License unless stated otherwise.