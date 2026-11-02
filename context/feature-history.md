
- **Project Setup:** Prepared the Vite + React + TypeScript SPA for all later features.
  - Added Tailwind v4 (`@tailwindcss/vite`, CSS-only config in `src/index.css`) and shadcn/ui (style `base-nova`, Base UI primitives) with button, slider, tabs, tooltip, toggle, toggle-group, select, switch, sheet, sonner, card and separator.
  - Installed Zustand and TanStack Query (devtools in dev only); `src/main.tsx` wraps the app in `QueryClientProvider`, `TooltipProvider` and the sonner `Toaster`.
  - Added the `@/*` alias (tsconfig + vite), Vitest (`vitest.config.ts`, node environment, pure-logic tests only, `npm test` / `npm run test:watch`), and `VITE_BASE` support for the GitHub Pages base path.
  - Built the dark layout shell in `src/App.tsx` (header, canvas area, sidebar, player bar placeholders); removed Vite template files; new title and black and white equalizer favicon.
  - Edited generated `sonner.tsx` to drop `next-themes`; ESLint turns off the fast-refresh rule for `src/components/ui/`.
  - Deferred: folder structure is created as each feature needs it.
