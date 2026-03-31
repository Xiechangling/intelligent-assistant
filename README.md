# Intelligent Assistant

> Windows-first desktop app for project-aware, local-first AI coding workflows inspired by Claude Code.

## Intelligent Assistant

Intelligent Assistant is a Windows-first desktop application for local, project-aware AI coding workflows. It brings a Claude Code-style experience into a polished GUI, making it easier to manage projects, sessions, model context, approvals, execution output, and review surfaces without losing the power of local agent-driven development.

The current version focuses on a single-user, local-first workflow and includes:
- project selection and context management
- persistent sessions and recovery
- conversational coding workflow
- command approval and execution visibility
- diff review and workflow presets
- native project folder picking

The goal is simple: make daily AI-assisted coding more intuitive, visible, and controllable than a terminal-only workflow.

## Current status

Version: `0.1.1`

## Stack

- React + Vite
- Zustand
- Tauri v2
- Rust

## Local development

### Frontend only

```bash
npm install
npm run dev
```

### Desktop app

```bash
npm install
npm run tauri:dev
```

## Build

```bash
npm run build
```

## Notes

- Windows-first MVP
- local-first / single-user scope
- secure local credential handling
- explicit approval before impactful commands
