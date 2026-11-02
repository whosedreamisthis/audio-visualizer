# Current Feature

Responsive Layout (see `context/features/responsive-layout.md`): static, non-functional UI for the studio: header, canvas stage with drop zone, tabbed control panel, player bar.

## Status

In Progress

## Goals

- [ ] Desktop (≥1024 px): canvas fills the main area, right sidebar with tabs (Mixer, EQ, Visual, Presets), bottom player bar
- [ ] Tablet (≥768 px): control panel opens as a right Sheet
- [ ] Mobile (<768 px): canvas on top, control panel in a bottom Sheet, compact sticky player bar
- [ ] Header with title, controls button (below lg) and fullscreen button
- [ ] Canvas stage with decorative static bars and the drop zone overlay
- [ ] Mixer, EQ, Visual and Presets panels built from shadcn components with hardcoded values
- [ ] Reusable `ControlRow` (label + value + control + reset)
- [ ] `100dvh` layout, 44 px touch targets, safe-area insets, no horizontal scroll from 320 px
- [ ] Verify at 375, 768 and 1280 px in the browser

## Notes

- UI only: no stores, audio or canvas drawing yet. Sliders and toggles use local/uncontrolled state.
- shadcn's current style uses Base UI: tooltips and triggers use the `render` prop instead of `asChild`.
- Folder structure grows as needed: `src/components/panels/`, `src/hooks/useMediaQuery.ts`.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
