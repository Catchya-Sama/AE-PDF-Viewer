# Development Rules

> Coding standards, conventions, and development workflow.

---

## Code Style

### TypeScript / React

- Use **TypeScript** for all new files (`.ts`, `.tsx`)
- Use **functional components** with hooks (no class components)
- Use **named exports** for components
- Use **PascalCase** for component files: `PdfViewer.tsx`, `Toolbar.tsx`
- Use **camelCase** for functions and variables: `getHostInfo()`, `currentPage`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_ZOOM_LEVEL`, `DEFAULT_THEME`

### ExtendScript (.jsx)

- Use **ES3-compatible** syntax (no arrow functions, no `const`/`let`, no `JSON` object)
- Use **var** for all variable declarations
- Build JSON strings **manually** (no `JSON.stringify()`)
- Use **null checks** before accessing `app.project`, `app.project.file`, etc.
- Avoid **top-level function calls** — wrap in `init()` or explicit functions

### CSS

- Use **CSS variables** for theming: `var(--bg-primary)`, `var(--text-primary)`
- Use **BEM-like naming** or **utility classes** (Tailwind planned)
- Dark theme is **default** (matches AE UI)

---

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `PdfViewer.tsx` |
| Service | camelCase.ts | `storageManager.ts` |
| Style | kebab-case.css | `global.css` |
| ExtendScript | camelCase.jsx | `host.jsx` |
| Config | camelCase.ts | `vite.config.ts` |
| Docs | UPPER_SNAKE.md | `PROJECT_VISION.md` |

---

## Git Workflow

### Branch Strategy

- `main` — Stable, production-ready
- `dev` — Development branch (if needed)
- `feature/phase-X-name` — Feature branches (e.g., `feature/phase-2-header`)

### Commit Message Format

```
<type>: <description>

[optional body]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `test` — Tests
- `chore` — Build, config, dependencies

**Examples:**
```
feat: add PDF viewer component
fix: resolve crossorigin error in CEP 9
docs: update roadmap for Phase 2
chore: update dependencies
```

---

## Project Structure

```
AE_PDF_Viewer/
├── CSXS/              # CEP manifest
├── docs/              # Documentation
├── jsx/               # ExtendScript files
├── public/            # Static assets (CSInterface.js, polyfills)
├── scripts/           # Build scripts
├── src/               # React source
│   ├── components/    # UI components
│   ├── services/      # Core services
│   ├── styles/        # CSS files
│   └── main.tsx       # Entry point
├── index.html         # HTML entry
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── vite.config.ts     # Vite config
```

---

## CEP 9 Compatibility Checklist

Before adding new features, ensure:

- [ ] No `type="module"` in script tags (use `type="text/javascript" defer`)
- [ ] No `crossorigin` attribute (custom Vite plugin handles this)
- [ ] No `JSON.stringify()` in ExtendScript (build strings manually)
- [ ] No ES6+ features in `.jsx` files (ES3 only)
- [ ] Null checks for `app.project` and `app.project.file`
- [ ] No top-level function calls in `.jsx` files