# Contributing

> Guidelines for contributing to Adobe Reference Workspace.

---

## Status

The project is currently under active development.

Suggestions, feedback, feature requests, and contributions are always welcome.

---

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - After Effects version & OS

### Suggesting Features

1. Open a new issue with `feature request` label
2. Describe the feature and its use case
3. Explain how it fits the project vision (see [PROJECT_VISION.md](./PROJECT_VISION.md))

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Follow the [Development Rules](./DEVELOPMENT_RULES.md)
4. Test your changes in After Effects
5. Commit with proper format (see [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md))
6. Push to your fork and submit a pull request

---

## Development Setup

### Prerequisites

- Node.js (v18+)
- npm
- Adobe After Effects 2020+ (for testing)
- Git

### Getting Started

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

### Testing in After Effects

1. Open After Effects
2. Go to `Window > Extensions > PDF Viewer`
3. For debugging, open `http://localhost:8088` in a browser

---

## Code Guidelines

Please read [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) before contributing. Key points:

- Use TypeScript for all new files
- Follow the naming conventions
- Test CEP 9 compatibility (no `type="module"`, no `JSON.stringify()` in ExtendScript)
- Use proper commit message format

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.