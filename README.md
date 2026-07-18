# Adobe Reference Workspace

> A modern Adobe After Effects CEP Extension designed to keep all creative references inside your workspace.

---

## Overview

**Adobe Reference Workspace** is a modern CEP (Common Extensibility Platform) extension for Adobe After Effects that aims to provide an integrated reference environment directly inside the application.

Instead of constantly switching between Adobe After Effects, PDF readers, file explorers, browsers, and note-taking applications, this extension brings all essential references into a single workspace.

The first module under development is a **PDF Viewer**, allowing artists, motion designers, editors, and animators to open and read PDF documents without leaving After Effects.

This project is built with scalability in mind. Rather than being a simple PDF viewer, it serves as the foundation for a complete reference ecosystem inside Adobe After Effects.

---

# Vision

Create a professional reference workspace that feels like a native Adobe panel while leveraging modern web technologies.

The long-term goal is to eliminate unnecessary context switching during creative workflows and provide creators with a centralized environment for viewing documentation, storyboards, design references, notes, and production assets.

---

# Project Status

> 🚧 Early Development (Phase 1)

Current progress:

* ✅ Project initialization
* ✅ Repository structure
* ✅ Development environment
* ✅ CEP project configuration
* ⏳ UI Prototype
* ⏳ Core Architecture
* ⏳ PDF Rendering Engine
* ⏳ Adobe Bridge Integration

---

# Development Roadmap

## Phase 0 — Research

* User experience research
* Architecture planning
* Blueprint creation
* Technical evaluation

## Phase 1 — Project Initialization

* Project setup
* React + TypeScript
* Vite configuration
* CEP configuration
* Development workflow

## Phase 2 — UI Prototype

* Header
* Sidebar
* Workspace
* Toolbar
* Footer
* Theme System

## Phase 3 — Core Architecture

* Core services
* Event Bus
* Storage Manager
* Theme Manager
* Configuration Manager

## Phase 4 — PDF Engine

* PDF.js integration
* Page rendering
* Zoom
* Search
* Navigation
* Thumbnail generation

## Phase 5 — Adobe Integration

* CSInterface
* ExtendScript Bridge
* Session synchronization
* Project integration

## Phase 6 — Storage

* Recent files
* Bookmarks
* Preferences
* Workspace persistence

## Phase 7 — Settings

* Appearance
* Performance
* Viewer configuration

## Phase 8 — Optimization

* Performance improvements
* Memory optimization
* Lazy loading
* Render optimization

## Phase 9 — Packaging

* Production build
* ZXP packaging
* Testing
* Release

---

# Planned Features

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

# Technology Stack

* React
* TypeScript
* Vite
* CEP (Adobe Common Extensibility Platform)
* ExtendScript
* PDF.js
* Tailwind CSS

---

# Architecture

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

# Project Philosophy

This project is not intended to become just another PDF viewer.

It is being developed as a scalable platform for building modern Adobe extensions that integrate seamlessly into creative workflows while maintaining a clean architecture, reusable components, and long-term maintainability.

---

# Contributing

The project is currently under active development.

Suggestions, feedback, feature requests, and contributions are always welcome.

---

# License

This project is released under the MIT License unless stated otherwise.