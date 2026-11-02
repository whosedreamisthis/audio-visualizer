# Project Setup

## Overview

Prepare the Vite + React + TypeScript scaffold with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and the base layout shell, so every later feature has a place to land.

## Goals

- [ ] Install dependencies: `zustand`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `lucide-react`, Tailwind v4 + `@tailwindcss/vite`, Vitest + Testing Library + `jsdom`
- [ ] Add the `@/*` → `src/*` alias to `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`
- [ ] Configure Tailwind v4 in `src/index.css` (`@import "tailwindcss"`, `@theme` tokens); no `tailwind.config.*`
- [ ] Run `npx shadcn@latest init` (dark theme default) and add: button, slider, tabs, tooltip, toggle, toggle-group, select, switch, sheet, sonner, card, separator
- [ ] Wrap the app in `QueryClientProvider` (defaults: `refetchOnWindowFocus: false`, `retry: 1`) with devtools in dev only
- [ ] Mount sonner `<Toaster />`
- [ ] Create the folder structure from `context/project-overview.md` section 11 (empty folders get a placeholder only when needed)
- [ ] Build the layout shell in `App.tsx`: header, canvas area, right sidebar, bottom player bar (placeholders)
- [ ] Remove the Vite template demo content (`App.css`, logos, counter)
- [ ] Add scripts: `test`, `test:watch`, `lint`; add `vitest.config.ts` (`src/**/*.test.ts`)
- [ ] Set the page `<title>`, favicon and `<html class="dark">`

## Requirements

- Strict TypeScript, no `any`
- `vite.config.ts` sets `base` from an env/const so it can be changed for GitHub Pages
- Dark-first theme tokens, including an `--accent` CSS variable the themes feature will drive

## Files

- `vite.config.ts`, `vitest.config.ts`, `components.json`
- `src/index.css`, `src/main.tsx`, `src/App.tsx`, `src/lib/utils.ts`

## Acceptance Criteria

- `npm run dev` shows the dark layout shell with no console errors
- `npm run build`, `npm run lint` and `npm test` pass
- A shadcn `Button` renders correctly with Tailwind v4 styling

## Notes

- Check current docs (Context7) for Tailwind v4 and shadcn Vite install steps before running them.
