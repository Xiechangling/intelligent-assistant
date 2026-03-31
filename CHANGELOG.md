# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-04-01

### Added
- Added a repository README with project overview, stack, and local development instructions.
- Added native project folder picking through the desktop app.
- Added desktop workflow surfaces for session persistence, conversational coding, execution visibility, and review flows.
- Added planning and UAT artifacts for v1 validation.

### Changed
- Polished the desktop shell to feel closer to a Claude Desktop-style experience.
- Refined layout behavior with fixed top toolbar and fixed composer.
- Updated sidebars, drawer, bottom tray, and conversation surfaces for a quieter visual hierarchy.
- Unified app version metadata to `0.1.1` across frontend and Tauri config.

### Fixed
- Fixed the Phase 1 project selection gap by replacing the placeholder project picker flow with a real native folder picker.
- Fixed project selection verification status and synchronized planning state with completed validation.
