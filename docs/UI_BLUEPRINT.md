# UI Blueprint

> UI/UX design specifications and component documentation.

---

## Status

> ✅ Phase 2 — UI Prototype Complete

---

## Layout

```text
┌─────────────────────────────────────────────────┐
│ Header (40px) — Logo + Title + Theme toggle    │
├──────────┬──────────────────────────────────────┤
│          │ Toolbar (44px) — Open, Page, Zoom, Search │
│ Sidebar  ├──────────────────────────────────────┤
│ (200px)  │                                      │
│ Thumbs   │ Workspace (flex)                     │
│          │ Empty state / Canvas                 │
├──────────┴──────────────────────────────────────┤
│ Footer (28px) — Page info, zoom, status         │
└─────────────────────────────────────────────────┘
```

---

## Components

### Header (`src/components/Header.tsx`)
- **Logo**: Blue square with "P" letter
- **Title**: "PDF Viewer"
- **Theme toggle**: Sun/moon icon button
- **Props**: `onToggleTheme`, `theme`

### Sidebar (`src/components/Sidebar.tsx`)
- **Header**: Shows page count or "No Document"
- **Thumbnail list**: Vertical scrollable list
- **Thumbnail item**: Placeholder box (3:4 aspect ratio) + page number label
- **Active state**: Blue border on selected thumbnail
- **Props**: `totalPages`, `currentPage`, `onPageSelect`
- **Dummy**: 5 placeholder thumbnails when no document loaded

### Toolbar (`src/components/Toolbar.tsx`)
- **Open button**: Primary blue button (always enabled)
- **Page navigation**: Previous ◀, page counter, Next ▶
- **Zoom controls**: Zoom out −, zoom level %, zoom in +, Fit, Width
- **Search**: Text input (disabled when no document)
- **Dividers**: Vertical lines between groups
- **Props**: `onOpen`, `onZoomIn/Out/Fit/Width`, `onSearch`, `onPrevPage`, `onNextPage`, `currentPage`, `totalPages`, `zoomLevel`, `hasDocument`

### Workspace (`src/components/Workspace.tsx`)
- **Empty state**: Dashed border icon (📄) + "No document loaded" + hint text
- **Document state**: Shows document name + page info + "PDF rendering will be integrated in Phase 4"
- **Props**: `hasDocument`, `documentName`, `currentPage`, `totalPages`

### Footer (`src/components/Footer.tsx`)
- **Left**: Document name + page info
- **Right**: Zoom level + status indicator (dot + text)
- **Status dot**: Green (ready) or gray (idle)
- **Props**: `currentPage`, `totalPages`, `zoomLevel`, `documentName`, `status`, `statusMessage`

---

## Theme System

### Dark Theme (default)
- Background: `#1e1e1e` (primary), `#2a2a2a` (secondary), `#333333` (tertiary)
- Text: `#cccccc` (primary), `#999999` (secondary), `#666666` (muted)
- Accent: `#4a9eff` (blue)
- Border: `#3c3c3c`

### Light Theme
- Background: `#f5f5f5` (primary), `#ffffff` (secondary), `#e0e0e0` (tertiary)
- Text: `#333333` (primary), `#666666` (secondary), `#999999` (muted)
- Accent: `#1976d2` (blue)
- Border: `#cccccc`

### Implementation
- CSS variables in `:root` (dark) and `[data-theme="light"]` (light)
- Toggle via `document.documentElement.setAttribute('data-theme', theme)`
- Smooth transitions (0.15s ease)

---

## Design Tokens

### Layout Dimensions
| Token | Value |
|-------|-------|
| `--header-height` | 40px |
| `--toolbar-height` | 44px |
| `--footer-height` | 28px |
| `--sidebar-width` | 200px |
| `--sidebar-min-width` | 140px |
| `--sidebar-max-width` | 400px |

### Typography
| Token | Value |
|-------|-------|
| `--font-size-xs` | 10px |
| `--font-size-sm` | 11px |
| `--font-size-md` | 12px |
| `--font-size-lg` | 14px |

### Transitions
| Token | Value |
|-------|-------|
| `--transition-fast` | 0.15s ease |
| `--transition-normal` | 0.25s ease |

---

## CSS Grid Layout

```css
.app {
  display: grid;
  grid-template-rows: var(--header-height) 1fr var(--footer-height);
  grid-template-areas: "header" "main" "footer";
}

.app-main {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--toolbar-height) 1fr;
  grid-template-areas:
    "sidebar toolbar"
    "sidebar workspace";
}