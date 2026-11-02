# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, store state, API responses, and data models
- Use type inference where obvious, explicit types where helpful
- Use discriminated unions for status (`"idle" | "loading" | "playing"...`) and union types for modes/themes (`VisualizerMode`, `ThemeId`)

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks
- Every `useEffect` that starts a loop, listener or observer must return a cleanup
- Effects must survive StrictMode double-mounting (idempotent `AudioEngine.init()`)
- Never put per-frame data in React state; the render loop reads typed arrays and `store.getState()` directly

## Vite (client-only SPA)

- No server components, server actions or API routes: this is a browser-only app
- Env vars must be prefixed `VITE_` and are public; never store secrets in the client
- Use the `@/*` alias for `src/*`
- Static assets (preset audio, manifest) live in `public/`
- Clean up the engine on HMR via `import.meta.hot?.dispose`

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `src/index.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed
- Tailwind is loaded through the `@tailwindcss/vite` plugin

Example v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

## State Management

### Zustand (client state)

- Stores live in `src/store/[name]Store.ts`, one concern per store (playback, audio, visualizer, ui, savedPresets)
- Subscribe with narrow selectors (`useAudioStore(s => s.gain)`); use `useShallow` when picking several fields
- Use `getState()` for transient reads inside the rAF loop and event handlers; never subscribe the canvas component to fast-changing state
- Use `subscribeWithSelector` where the audio engine must react to store changes
- `persist` stores must use `partialize` (do not save transient fields like `status`, `track`, `currentTime`), a `version` and a `migrate`
- Actions live in the store; components do not mutate state directly
- Throttle high-frequency writes (time updates about 4-10 Hz)

### TanStack Query (server state)

- Only for remote or async data (preset manifest, preset audio). Never for UI or playback state
- Never copy query data into Zustand
- Centralize query keys in `src/api/queryKeys.ts`; fetchers in `src/api/`, hooks in `src/api/hooks.ts`
- Always handle `isPending`, `isError` and retry paths in the UI
- Revoke object URLs created from fetched blobs on cleanup

## Web Audio & Canvas

- `AudioEngine` and visualizers are framework-agnostic: no React imports
- Create the `AudioContext` lazily and `resume()` it on the first user gesture
- Call `createMediaElementSource` once per `<audio>` element; reuse the element and change `src`
- Change audio params with `setTargetAtTime` to avoid zipper noise
- Allocate typed arrays, gradients and particle pools once; reallocate only on FFT size or resize change
- Canvas is DPR-aware (cap at 2) and resized with `ResizeObserver`
- Clamp `dt` after tab switches and pause the loop when `document.hidden`
- Revoke `URL.createObjectURL` values when swapping tracks
- Validate dropped files (MIME type, extension, size) before loading

## File Organization

- Components: `src/components/ComponentName.tsx` (feature subfolders when it grows)
- shadcn primitives: `src/components/ui/` (generated; don't hand-edit, wrap instead)
- Hooks: `src/hooks/useX.ts`
- Stores: `src/store/xStore.ts`
- Audio engine: `src/audio/`
- Visualizers and themes: `src/visualizers/`
- API fetchers and query hooks: `src/api/`
- Types: `src/types/`
- Lib/Utils: `src/lib/[utility].ts`

## Naming

- Components: PascalCase (`SeekBar.tsx`)
- Hooks: `useX.ts`
- Other modules: camelCase (`beatDetector.ts`)
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components (button, slider, tabs, tooltip, sheet, sonner...) instead of hand-rolling them
- Use `cn()` from `@/lib/utils` for conditional classes
- No inline styles except dynamic values (such as canvas size)
- Dark mode first
- Theme accent is exposed as the `--accent` CSS variable so UI chrome and canvas stay in sync
- Respect `prefers-reduced-motion`

## Accessibility

- All controls keyboard operable with visible focus
- Sliders have labels and `aria-valuetext` (e.g. "+4 dB")
- Canvas has `role="img"` and a descriptive `aria-label`
- Don't use color as the only indicator

## Error Handling

- Use try/catch around async audio loading, decoding and fetching
- Surface user-friendly errors via sonner toast and set playback `error`
- Handle autoplay-blocked, unsupported format, decode failure, network failure and mic-permission denial
- Never swallow errors in empty `catch` blocks

## Testing

- Unit tests use **Vitest**: `npm test` runs once, `npm run test:watch` watches
- Test pure logic only: `bands.ts`, `beatDetector.ts`, store actions and migrations, `validateAudioFile`, format helpers. Don't test components, canvas drawing or real Web Audio nodes
- Name test files `*.test.ts` and put them next to the code they test
- Import `describe`, `it`, `expect` and `vi` from `vitest` explicitly (no globals)
- Mock browser APIs (`AudioContext`, `fetch`) with `vi.mock` / `vi.stubGlobal`; never hit the network
- Cover the happy path and the error cases; don't write tests just to write them

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
- Run `npm run lint` and `npm run build` before committing
