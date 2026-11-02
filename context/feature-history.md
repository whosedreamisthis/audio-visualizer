
- **Project Setup:** Prepared the Vite + React + TypeScript SPA for all later features.
  - Added Tailwind v4 (`@tailwindcss/vite`, CSS-only config in `src/index.css`) and shadcn/ui (style `base-nova`, Base UI primitives) with button, slider, tabs, tooltip, toggle, toggle-group, select, switch, sheet, sonner, card and separator.
  - Installed Zustand and TanStack Query (devtools in dev only); `src/main.tsx` wraps the app in `QueryClientProvider`, `TooltipProvider` and the sonner `Toaster`.
  - Added the `@/*` alias (tsconfig + vite), Vitest (`vitest.config.ts`, node environment, pure-logic tests only, `npm test` / `npm run test:watch`), and `VITE_BASE` support for the GitHub Pages base path.
  - Built the dark layout shell in `src/App.tsx` (header, canvas area, sidebar, player bar placeholders); removed Vite template files; new title and black and white equalizer favicon.
  - Edited generated `sonner.tsx` to drop `next-themes`; ESLint turns off the fast-refresh rule for `src/components/ui/`.
  - Deferred: folder structure is created as each feature needs it.

- **Responsive Layout:** Built the static, non-functional studio UI that later features wire up.
  - `src/App.tsx`: `h-dvh` layout with header (title, Controls button below 1024 px, fullscreen button), canvas area, desktop sidebar and player bar. Below 1024 px the control panel opens in a shadcn Sheet: right side at 768 px and up, bottom sheet on mobile.
  - `src/components/CanvasStage.tsx`: decorative static spectrum behind the drop zone card (Choose file / Use a preset).
  - `src/components/ControlPanel.tsx` with Tabs and panels in `src/components/panels/`: Mixer (gain, speed, preserve pitch), EQ (3 vertical sliders, bypass, presets), Visual (mode, theme swatches, FFT, smoothing, sensitivity, bar count, glow, mirror), Presets (sample tracks, microphone, saved presets placeholder).
  - `src/components/PlayerBar.tsx`: transport, seek, time, volume and speed readout (hidden below 768 px); `src/components/ControlRow.tsx` shared label/value/reset row; `src/hooks/useMediaQuery.ts`.
  - Values are hardcoded and uncontrolled; touch targets are at least 44 px, with safe-area insets. No tests added: the feature is components only, and `useMediaQuery` only wraps a browser API.

- **Types and Constants:** Added the shared foundation that the engine, stores, visualizers and UI will import.
  - `src/types/index.ts`: `VisualizerMode`, `ThemeId`, `EqBandId`, `FftSize`, `TrackSource`, `Size`, `TrackMeta`, `PresetTrack`, `BandEnergy`, `AudioFrame`, `Theme`, `VisualizerSettings`, `DrawArgs`, `Visualizer`.
  - `src/lib/constants.ts`: gain, volume, speed, EQ range, EQ band definitions (200 Hz low shelf, 1 kHz peaking, 4 kHz high shelf), FFT sizes and default, smoothing, sensitivity, band frequency ranges, accepted extensions and the 100 MB file cap.
  - `src/lib/math.ts`: `clamp` (non-finite → min), `lerp`, `mapRange`; `src/lib/format.ts`: `formatTime`, `formatDb`, `formatPercent`, `formatSpeed` with safe fallbacks for `NaN`, `Infinity` and negatives.
  - Vitest: `math.test.ts` and `format.test.ts` (16 tests). Nothing imports the constants yet; the static UI still has hardcoded values.
