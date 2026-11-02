# Keyboard Shortcuts and Fullscreen

## Overview

Keyboard control for the whole player plus an immersive fullscreen mode with auto-hiding controls.

## Goals

- [ ] `useKeyboardShortcuts`: Space play/pause, ←/→ seek ±5 s, ↑/↓ volume ±5%, `M` mute, `L` loop, `F` fullscreen, `1/2/3` switch visualizer
- [ ] Ignore shortcuts while typing in inputs/textareas/selects or when a modifier key is held
- [ ] `useFullscreen`: Fullscreen API on the visualizer container, tracks `fullscreenchange`, handles Esc and unsupported browsers
- [ ] Fullscreen button in the header with tooltip
- [ ] Auto-hide controls after 3 s of inactivity in fullscreen; show on mouse move/touch/key press; cursor hides too
- [ ] Shortcut help dialog (`?` key) listing all shortcuts
- [ ] Toast or brief on-canvas indicator for volume/seek/mode changes

## Requirements

- Space does not scroll the page and does not double-trigger when a button is focused
- Listeners cleaned up on unmount; works under StrictMode

## Tests (Vitest)

- Pure key → action mapping function: mapped keys, ignored when typing, ignored with modifiers

## Acceptance Criteria

- Every shortcut works with focus on the page body
- Fullscreen enters/exits via button, `F` and Esc, and controls auto-hide and return correctly
