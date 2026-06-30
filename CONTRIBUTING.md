# Contributing to Wander

Thanks for your interest in contributing. This is a small, focused tool, and we want to keep it that way.

## Quick Start

1. **Fork** the repo and clone your fork.
2. Make sure you have the prerequisites installed (see [README.md](README.md#prerequisites)).
3. Run `wails dev` to start the app in development mode with hot reload.
4. Make your changes.
5. Ensure the app builds cleanly:
   ```bash
   wails build
   ```
6. Open a **pull request** against the `main` branch with a clear description of what changed and why.

## Guidelines

- **Keep it small.** A PR should ideally do one thing. If you're adding a feature and fixing a bug, split them.
- **No dependencies without a reason.** The goal is a single, self-contained binary. Prefer the standard library or Wails-provided tooling.
- **Go code:** `go fmt`, `go vet`, and `go test` should all pass.
- **Frontend code:** TypeScript should compile without errors (`npm run build` in `frontend/`).
- **UI:** Match the existing industrial dark aesthetic. No heavy UI frameworks.
- **Markdown viewer changes** must render correctly with **zero JavaScript** on the phone (with the exception of Mermaid diagrams, which are client-side by design).

## What We're Not Looking For

- Cloud sync, authentication, or account systems.
- Heavy UI frameworks (no Material, no Bootstrap).
- Client-side JavaScript in the phone viewer for basic markdown features.

## Questions?

Open an issue. The project is small enough that a GitHub issue is the right place for discussion.
