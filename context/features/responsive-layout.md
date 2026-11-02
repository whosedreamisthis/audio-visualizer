# Responsive Layout

## Overview

Make the studio comfortable from 375 px phones to large desktops.

## Goals

- [ ] Desktop (≥1024 px): canvas fills the main area, collapsible right sidebar (Tabs: Mixer, EQ, Visual, Presets), bottom player bar
- [ ] Tablet (≥768 px): sidebar overlays as a shadcn Sheet from the right
- [ ] Mobile (<768 px): canvas on top (about 40-50% height), controls in a bottom sheet with tabs, sticky compact player bar
- [ ] Header with title, fullscreen and settings toggle
- [ ] Use `100dvh` so mobile browser chrome doesn't cause overflow
- [ ] Sidebar collapse persists in `uiStore`; canvas resizes smoothly when it toggles
- [ ] Touch-friendly sliders and 44 px minimum targets
- [ ] Safe-area insets for notched devices

## Requirements

- No horizontal scroll at any width from 320 px
- Canvas redraws correctly after orientation change

## Acceptance Criteria

- Layout checked at 375, 768 and 1280 px (use the `ui-reviewer` agent)
- All panels reachable and usable on mobile
