# CLAUDE.md

## Project

This repository uses the GSD workflow and currently tracks the Intelligent Assistant project.

## Workflow Expectations

- Use GSD artifacts in `.planning/` as the source of truth for project context.
- Follow roadmap order unless the user explicitly reprioritizes work.
- Prefer `/gsd:discuss-phase N` before `/gsd:plan-phase N` for non-trivial phases.
- Validate implementation decisions against `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`.
- Preserve the project's MVP boundaries: single-user, local-first, Windows-first.

## Current Focus

Phase 1 — Desktop Shell & Project Foundation

## Key Product Constraints

- Windows-first desktop app
- Polished UI is part of product value
- Hybrid local CLI + Claude API architecture
- Secure local credential handling
- Explicit command approval for impactful actions
