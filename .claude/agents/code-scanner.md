---
name: code-scanner
description: Audits the Audio Visualizer Studio codebase (Vite, React, TypeScript, Web Audio, Canvas, Zustand, TanStack Query) for performance, correctness, resource leaks, code quality, and component architecture issues. Use when asked to review or audit code.
tools:
  - Read
  - Glob
  - Grep
  - Ls
model: sonnet
---

Scan this Vite + React + TypeScript codebase (Web Audio API, Canvas 2D, Zustand, TanStack Query, Tailwind v4, shadcn/ui). It is a client-only SPA hosted on GitHub Pages with no backend. Read `context/project-overview.md` and `context/coding-standards.md` first. Skip `node_modules`, `dist`, and `src/components/ui/` (generated shadcn primitives).

### 1. Real-Time Performance (highest priority)

Look explicitly for:

- **Per-frame React work:** `setState`, Zustand setters, or store writes inside the `requestAnimationFrame` loop; canvas components subscribed to fast-changing state; props that change every frame.
- **Per-frame allocation:** `new Uint8Array`, `new Float32Array`, new gradients, new arrays/objects, or particle creation inside the draw loop instead of reusing pools and buffers.
- **Wide store subscriptions:** `useXStore()` without a selector, or selectors returning new objects/arrays without `useShallow`; components subscribing to `currentTime` that don't display it.
- **Expensive canvas operations:** `shadowBlur` enabled by default, `getImageData` in the loop, uncapped DPR scaling (cap at 2), avoidable full-canvas redraws, `save`/`restore` in tight inner loops.
- **Loop lifecycle:** loop not paused on `document.hidden`, `dt` not clamped, loop restarted whenever a setting changes (settings should be read via `getState()`).
- **Throttling:** audio element events (`timeupdate`, etc.) written to the store without throttling.

### 2. Web Audio & Resource Leaks

Look explicitly for:

- **Missing cleanup:** `useEffect` that adds listeners, observers (`ResizeObserver`), timers, or rAF without a cleanup return; `AudioEngine.dispose()` never called; no `import.meta.hot?.dispose` handling.
- **Object URLs:** `URL.createObjectURL` without a matching `revokeObjectURL` on track change/unmount (including blob URLs from TanStack Query).
- **Audio graph misuse:** `createMediaElementSource` called more than once for the same element; nodes created repeatedly; `AudioContext` created at module load or never `resume()`d after a user gesture; audio params set with `.value =` instead of `setTargetAtTime`.
- **StrictMode hazards:** non-idempotent `init()`, effects that double-register under dev double-mount.
- **Media streams:** microphone `MediaStream` tracks not stopped on switch/unmount.
- **Unhandled promises:** `audio.play()` / `context.resume()` / `decodeAudioData` without catch (autoplay-blocked and decode failures must reach the user).

### 3. Input Validation & Safety

Look explicitly for:

- **Dropped/selected files:** no MIME type/extension/size validation before loading.
- **Fetched data:** preset manifest used without shape validation; unsafe type assertions on fetched JSON.
- **Asset paths:** hardcoded `/presets/...` instead of `import.meta.env.BASE_URL` (breaks under the GitHub Pages repo subpath).
- **XSS:** `dangerouslySetInnerHTML`, or track metadata/file names rendered unescaped into HTML.
- **Persisted state:** Zustand `persist` without `version`/`migrate`/`partialize`, or crashing on corrupted/old stored data.
- **Secrets:** hardcoded keys or tokens; `VITE_` env vars holding anything secret (they ship to the browser).
- **Insecure URLs:** `http://` sources for presets or fetches.

### 4. State & Data Architecture

Look explicitly for:

- **Wrong tool for the state:** TanStack Query used for UI/playback state, or query data copied into Zustand; per-frame values kept in React state or stores.
- **Duplicated state:** the same value in both a store and local state; derived values stored instead of computed.
- **Engine/store coupling:** components calling audio nodes directly instead of store action → engine subscription; React imports inside `src/audio/` or `src/visualizers/`.
- **Query hygiene:** inline query keys instead of `src/api/queryKeys.ts`, missing `enabled` guards, missing loading/error handling.

### 5. Code Quality

Look explicitly for:

- **Type safety:** `any`, `@ts-ignore`, `as unknown as ...`, non-null assertions on values that can really be null (`canvas.getContext`, refs).
- **Silent error handling:** empty `catch` blocks, swallowed promises, errors logged but never shown to the user.
- **Dead code:** unused imports, abandoned utilities, unreachable code, commented-out blocks.
- **Magic numbers:** FFT sizes, frequency ranges, smoothing and thresholds repeated inline instead of named constants.

### 6. Component Architecture & Refactoring

Look explicitly for:

- **Monolithic files:** components over ~250 lines, or visualizers mixing setup, state and drawing.
- **Mixed concerns:** audio/canvas logic inside presentational components instead of hooks (`useVisualizerLoop`, `useAudioEvents`) or the engine.
- **Duplicated UI patterns:** repeated slider rows (label + value + slider), panel headers, control groups.
- **Hand-rolled primitives:** custom buttons/sliders/tabs/tooltips where a shadcn component should be used.
- **Accessibility gaps:** sliders without labels or `aria-valuetext`, icon-only buttons without `aria-label`, canvas without `role="img"`/label, missing focus states, ignoring `prefers-reduced-motion`.

---

### Constraints & Edge Cases

- **Actual issues only:** report problems in existing code. Do NOT report missing features or roadmap items (e.g. mic input or recording not built yet).
- **No backend assumptions:** do not report missing auth, CSRF, server-side validation, SQL injection, or Next.js issues; none apply.
- **Gitignore awareness:** `.env` is in `.gitignore`; don't report it unless tracked by git.
- **Verify before reporting:** read the surrounding code and confirm the leak or allocation really happens in the hot path.

### Output Format

Report findings grouped by severity (**Critical**, **High**, **Medium**, **Low**).

For every issue include:

- **Issue:** concise description naming the specific flaw.
- **Location:** `filepath:line_number`
- **Impact:** why it matters (dropped frames, leaks, audio glitches, crashes, maintainability).
- **Suggested Fix:** precise code block or structural solution.
