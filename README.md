# Intelligent Assistant

Windows-first desktop app for Claude Code-style local coding workflows.

## Current status

Version: `0.1.1`

This repo currently includes:
- project-aware desktop shell
- session persistence and recovery
- conversational coding workflow
- command approval and execution visibility
- diff review, presets, and workflow polish
- native project folder picker

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
