# Current Feature

Project Setup (see `context/features/project-setup.md`): Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and the base layout shell.

## Status

In Progress

## Goals

- [x] Install dependencies (zustand, TanStack Query + devtools, lucide-react, Tailwind v4, Vitest; no jsdom or Testing Library, tests are pure logic only)
- [x] `@/*` alias in tsconfig and vite config
- [x] Tailwind v4 via `@tailwindcss/vite`, CSS-only config in `src/index.css`
- [x] shadcn/ui init and components: button, slider, tabs, tooltip, toggle, toggle-group, select, switch, sheet, sonner, card, separator
- [x] `QueryClientProvider` (devtools in dev only), `TooltipProvider` and sonner `Toaster`
- [x] Layout shell in `App.tsx` (header, canvas area, sidebar, player bar placeholders)
- [x] Remove Vite template demo content
- [x] Scripts `test`, `test:watch`, `lint`; `vitest.config.ts`
- [x] Page title, audio-themed favicon, `<html class="dark">`
- [ ] Create the folder structure from project-overview section 11 (added as features need them)
- [ ] Verify in the browser

## Notes

- shadcn's current default style (`base-nova`) uses Base UI primitives instead of Radix; the generated `sonner.tsx` was edited to drop `next-themes` (dark only).
- `vite.config.ts` reads `VITE_BASE` so the GitHub Pages base path can be set at build time.

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->
