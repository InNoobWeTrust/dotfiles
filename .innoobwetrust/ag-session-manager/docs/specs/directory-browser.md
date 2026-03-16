# Feature: Directory Browser

> **Status**: revised (v2)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16
> **Revised**: 2026-03-16 — Symlink cross-volume support, env variable expansion

## Parent TRD

`docs/trds/ag-session-manager.md` — Directory Browser component

## Description

Browse the local filesystem to select a working directory for new sessions.
Directory listing is constrained to configurable root paths for security.
Supports git repo detection and favorite directories.

## User Stories

- As a **developer**, I want to **browse my project directories on my phone**, so that **I can pick the right working directory for a new session**.
- As a **developer**, I want to **bookmark frequently used directories**, so that **I can quickly access them**.

## Scenarios

### Scenario: Browse a directory successfully

- **Given** `/Users/me/projects` is in `BROWSE_ROOTS`
- **When** I GET `/api/dirs?path=/Users/me/projects`
- **Then** the response contains `{path, parent, entries}` where entries list subdirectories and files with name, type, and size

### Scenario: Browse root shows allowed roots

- **Given** `BROWSE_ROOTS` is set to `/Users/me/projects,/tmp`
- **When** I GET `/api/dirs` (no path parameter)
- **Then** the response contains the root directories as entries

### Scenario: Detect git repository

- **Given** `/Users/me/projects/myapp` contains a `.git` directory
- **When** I GET `/api/dirs?path=/Users/me/projects`
- **Then** the `myapp` entry includes `isGitRepo: true`, `gitBranch: "main"`, and `gitDirty: false`

### Scenario: Reject path outside allowed roots

- **Given** `BROWSE_ROOTS` is `/Users/me/projects`
- **When** I GET `/api/dirs?path=/etc/passwd`
- **Then** the response status is 400
- **And** the body contains: "Path outside allowed roots"

### Scenario: Reject path traversal attack

- **Given** `BROWSE_ROOTS` is `/Users/me/projects`
- **When** I GET `/api/dirs?path=/Users/me/projects/../../etc`
- **Then** the path is resolved to `/etc` which is outside roots
- **And** the response status is 400

### Scenario: Follow symlinks to other volumes

- **Given** `BROWSE_ROOTS` is `/Users/me`
- **And** `/Users/me/Developer` is a symlink to `/Volumes/ExternalSSD/Developer`
- **When** I GET `/api/dirs?path=/Users/me/Developer`
- **Then** the response succeeds (logical path is under root)
- **And** entries within the symlinked directory are listed
- **And** symlinked entries include `isSymlink: true`

### Scenario: Symlinked directories appear as directories

- **Given** `/Users/me/projects/link` is a symlink to a directory
- **When** I GET `/api/dirs?path=/Users/me/projects`
- **Then** the entry for `link` has `type: "dir"` (not `"file"`)
- **And** `isSymlink: true`

### Scenario: Non-existent path

- **Given** `BROWSE_ROOTS` is `/Users/me/projects`
- **When** I GET `/api/dirs?path=/Users/me/projects/noexist`
- **Then** the response status is 404

### Scenario: Add and list favorites

- **Given** no favorites exist
- **When** I POST `/api/dirs/favorites` with `{"path": "/Users/me/projects/myapp", "label": "My App"}`
- **Then** the response status is 201
- **When** I GET `/api/dirs/favorites`
- **Then** the response contains the added favorite

### Scenario: Default BROWSE_ROOTS

- **Given** `BROWSE_ROOTS` is not set in `.env`
- **When** the server starts
- **Then** `BROWSE_ROOTS` defaults to the current user's home directory

## Validation Rules

- All paths resolved to absolute before comparison
- Path allowed if **either** the logical path (before symlink resolution) **or** the real path (after resolution) is under a configured root
- Symlinks are followed when determining entry type (`statSync` not `lstatSync`)
- Symlinked entries marked with `isSymlink: true`
- Broken symlinks fall back to `lstatSync` and are still listed
- Directory entries sorted: directories first, then files, alphabetical within each
- Hidden files/directories (starting with `.`) are included but marked
- `node_modules`, `.git` contents are not listed (only `.git` existence is detected)
- Favorites persisted in `~/.config/ag-session-manager/favorites.json`
- Maximum 50 favorites
- `BROWSE_ROOTS` supports `~`, `$HOME`, and `${HOME}` expansion (dotenv does not expand shell variables natively)

## Out of Scope

- File content viewing or editing
- Remote filesystem (SSH/SFTP) browsing
- File upload or download
- Search within directories

## Dependencies

- None (standalone module)

## ⚔ Challenge Gate

> **Status**: passed
> **Challenger**: AI (self-challenge)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | security | Symlinks could escape BROWSE_ROOTS. `readlink` resolves to targets outside roots. | Good catch. Must resolve symlinks with `fs.realpath` before checking against roots. | challenger-won |
| 2 | edge cases | Large directories (10k+ files) could slow the response. | Add a limit of 500 entries per request. If exceeded, return first 500 with `truncated: true`. | challenger-won |
| 3 | edge cases | Cross-volume symlinks (e.g. `~/Developer` → `/Volumes/ExternalSSD/Developer`) are rejected because the real path is outside roots. | Accept path if **either** the logical path or the resolved path is under a root. This allows following symlinks from root dirs to other volumes while maintaining security. | challenger-won |

### Challenge Summary

- **Challenges raised**: 3
- **Author victories**: 0
- **Challenger victories**: 3
- **Escalated**: 0
- **Overall verdict**: ACCEPTED (with revisions: symlink resolution, entry limit, cross-volume symlinks)

### Revisions Made

- **Rev 1**: Symlink resolution check with `fs.realpathSync` (original)
- **Rev 2**: Entry limit of 500 per directory listing (original)
- **Rev 3 (v2)**: Cross-volume symlink support — logical OR real path check
- **Rev 4 (v2)**: `statSync` for entry type detection (follows symlinks), with `lstatSync` fallback for broken symlinks
- **Rev 5 (v2)**: `$HOME`, `${HOME}`, `$USER` expansion in `BROWSE_ROOTS` env var (dotenv compatibility)
