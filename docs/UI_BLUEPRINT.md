# UI Blueprint

> UI/UX design specifications and component documentation.

---

## Status

> 🚧 To be defined in Phase 2 — UI Prototype

This document will be populated during Phase 2 development.

---

## Planned Layout

```text
┌─────────────────────────────────────────────────┐
│ Header (logo + title + window controls)         │
├──────────┬──────────────────────────────────────┤
│          │ Toolbar (Open, Zoom, Search, Page)   │
│ Sidebar  ├──────────────────────────────────────┤
│ (thumbs) │                                      │
│          │ Workspace (canvas area)              │
│          │                                      │
│          │                                      │
├──────────┴──────────────────────────────────────┤
│ Footer (page info, status)                       │
└─────────────────────────────────────────────────┘
```

---

## Components (Planned)

### Header
- Logo + Title
- Window controls (close, minimize)

### Sidebar
- Thumbnail list
- Scrollable
- Resizable width

### Toolbar
- Open file button
- Zoom controls (in, out, fit, fit-width)
- Search bar
- Page navigation (prev, next, page input)

### Workspace
- Canvas area for PDF rendering
- Empty state when no document loaded
- Loading state

### Footer
- Current page / total pages
- Zoom level
- Document name
- Status messages

---

## Theme System

- Dark theme (default, matches AE UI)
- Light theme
- CSS variables for easy switching
- Smooth transitions

---

## Design Tokens

To be defined in Phase 2:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Animations