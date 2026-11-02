# 🎧 Audio Visualizer Studio — Project Overview

> **A browser-based studio where you drop in a song and watch it come alive: real-time waveforms, frequency bars and particle spectrums, with live control over gain, EQ, speed and themes.**

---

## Table of Contents

1. [Problem & Concept](#1-problem--concept)
2. [Target Users](#2-target-users)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Audio Engine](#6-audio-engine)
7. [Render Loop & Visualizers](#7-render-loop--visualizers)
8. [State Management (Zustand)](#8-state-management-zustand)
9. [Server State (TanStack Query)](#9-server-state-tanstack-query)
10. [Types](#10-types)
11. [Project Structure](#11-project-structure)
12. [UI / UX](#12-ui--ux)
13. [Performance Rules](#13-performance-rules)
14. [Development Rules](#14-development-rules)
15. [Roadmap](#15-roadmap)
16. [Open Questions](#16-open-questions)
17. [Reference Links](#17-reference-links)

---

## 1. Problem & Concept

Most music visualizers are either desktop apps, locked inside a player, or too simple to tweak. This project is a **zero-install, in-browser studio**: drag an audio file onto the page (or pick a bundled preset track), press play, and an interactive `<canvas>` renders the sound in real time.

**What this project is meant to demonstrate (technical signals):**

| Signal | How it is shown |
| --- | --- |
| **Web Audio API** | `AudioContext`, `MediaElementAudioSourceNode`, `GainNode`, `BiquadFilterNode` chain, `AnalyserNode` reading frequency/time-domain data every frame |
| **Canvas performance** | `requestAnimationFrame` loop that lives *outside* React's render cycle; zero component re-renders per frame |
| **Complex client state** | Zustand store slices for playback, audio params, visualizer settings; selector-based subscriptions; transient (non-reactive) reads inside the loop |
| **Server state done right** | TanStack Query for the preset track library and decoded remote audio, with caching, loading and error states |
| **TypeScript rigor** | Strict types for audio graph, visualizer plugin interface, and store slices |

---

## 2. Target Users

- **Music fans / casual users**: drop in a track and enjoy a reactive visual.
- **Streamers & content creators**: screen-capture a good-looking visualizer as a backdrop.
- **Musicians / producers**: quickly hear a track through EQ and speed changes while watching the spectrum.
- **Developers / recruiters**: evaluating a portfolio piece showing Web Audio, Canvas and state-management skill.

---

## 3. Features

### 3.1 Core (MVP)

- **Audio input**
  - Drag-and-drop zone plus file picker (`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, validated by MIME type and size).
  - Preset tracks loaded from a manifest (royalty-free).
- **Playback controls**: play / pause, seek bar, current time / duration, volume, mute, loop, **playback speed (0.5x–2x)**.
- **Visualizers** (switchable live):
  1. **Waveform**: oscilloscope-style time-domain line.
  2. **Frequency Bars**: mirrored or standard bars with peak caps.
  3. **Particle Spectrum**: particles emitted and accelerated by bass/mid/treble energy.
- **Audio controls**
  - Master **gain** slider (0–200%).
  - **3-band EQ** (low shelf, mid peaking, high shelf) with ±12 dB sliders.
  - Reset-to-flat button.
- **Themes**: color palettes (Neon, Sunset, Ocean, Mono, Aurora) applied to the canvas and UI accents.
- **Responsive canvas**: auto-resizes with `ResizeObserver`, honors `devicePixelRatio`.

### 3.2 Enhanced

- 10-band graphic EQ with presets (Flat, Bass Boost, Vocal, Treble, Lo-Fi).
- Visualizer settings: FFT size, smoothing, bar count, sensitivity, particle count, line width, glow.
- Fullscreen mode + auto-hiding controls.
- Keyboard shortcuts (Space play/pause, ←/→ seek, ↑/↓ volume, `F` fullscreen, `1/2/3` switch visualizer, `M` mute).
- Settings persisted to `localStorage` (Zustand `persist`) and saved **custom presets** (named EQ + theme + visualizer combos).
- Microphone input as a live source (`getUserMedia`).
- Beat detection (bass energy threshold) driving pulse effects.

### 3.3 Stretch

- Record the canvas + audio to video (`canvas.captureStream()` + `MediaRecorder`) and download.
- Offscreen rendering (`OffscreenCanvas` in a Web Worker).
- Playlist / queue.
- Shareable preset links (settings encoded into the URL hash).
- WebGL / shader-based visualizer.

---

## 4. Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| App type | **Client-side single page application** | No SSR, no server components, no API routes, no backend or database; everything runs in the browser and deploys as static files |
| Build tool | **Vite** | React + TS template; env vars use the `VITE_` prefix and are public |
| UI | **React 19** + **TypeScript** (strict) | Function components and hooks only |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Dark-first, CSS variables for theme accents |
| Client state | **Zustand** | Slices + `persist` + `subscribeWithSelector` |
| Server state | **TanStack Query v5** | Preset manifest and remote audio fetching |
| Graphics | **Canvas 2D API** | `requestAnimationFrame` loop |
| Audio | **Web Audio API** | Native, no audio libraries |
| Icons | `lucide-react` | |
| UI components | **shadcn/ui** (Radix primitives + Tailwind) | Slider, Tabs, Button, Tooltip, Toggle, Select, Switch, Sheet, Sonner toasts, Card, Separator; components are copied into `src/components/ui/` |
| Lint / format | ESLint + Prettier | Already scaffolded ESLint |
| Testing | Vitest + React Testing Library | Pure logic (EQ math, beat detection, store) |

> **Note:** check current docs (Context7) for Tailwind v4, TanStack Query v5 and Zustand v5 APIs before implementing; they have changed significantly between majors.

### Install

```bash
npm install zustand @tanstack/react-query lucide-react
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react jsdom
npm install -D @tanstack/react-query-devtools

# shadcn/ui (needs the "@" path alias in vite.config.ts and tsconfig)
npx shadcn@latest init
npx shadcn@latest add button slider tabs tooltip toggle toggle-group select switch sheet sonner card separator
```

shadcn/ui setup notes: add the `@/*` → `src/*` alias to `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`; shadcn generates `components.json`, `src/lib/utils.ts` (`cn()`) and theme CSS variables in `index.css`. The audio-specific `--accent` variable is layered on top of shadcn's tokens.

---

## 5. Architecture

### 5.1 Guiding principle

> **React owns the UI. The audio engine and canvas loop own the real-time work.** Per-frame data never goes through React state.

```
┌────────────────────────────── React (UI layer) ──────────────────────────────┐
│  DropZone  PlayerControls  EqPanel  VisualizerPicker  ThemePicker  Presets   │
│        │ read via selectors / write via actions                              │
└────────┼──────────────────────────────────────────────────────────────────────┘
         ▼
┌────────────────────────── Zustand stores (source of truth) ──────────────────┐
│  playbackStore   audioStore (gain, eq, speed)   visualizerStore (mode, theme) │
└────────┬───────────────────────────────┬──────────────────────────────────────┘
         │ subscribe() → imperative       │ getState() (transient read per frame)
         ▼                                ▼
┌─────────────── AudioEngine (singleton) ┐   ┌────────── Render loop ──────────┐
│ <audio> → MediaElementSource           │   │ rAF → analyser.getByteData()    │
│   → Low → Mid → High → Gain → Analyser │──▶│ → visualizer.draw(ctx, frame)   │
│   → destination                        │   │ (no React re-render)            │
└────────────────────────────────────────┘   └─────────────────────────────────┘
```

### 5.2 Data flow rules

1. **UI → Store → Engine.** A slider updates the store; an engine subscription applies it to the matching node (`gainNode.gain.setTargetAtTime`). Components never touch audio nodes.
2. **Engine → Canvas, bypassing React.** The render loop reads `AnalyserNode` data into reused typed arrays and draws directly.
3. **Engine → Store (low frequency only).** `timeupdate`, `loadedmetadata`, `ended` events update `currentTime`/`duration` at a throttled rate (about 4–10 Hz) for the seek bar.
4. **Server data → TanStack Query**, never copied into Zustand.

### 5.3 Autoplay policy

`AudioContext` starts `suspended` in most browsers. The engine is created lazily and `resume()` is called on the first user gesture (drop, click, or play).

---

## 6. Audio Engine

A framework-agnostic class in `src/audio/AudioEngine.ts`, exposed as a singleton. It has no React imports.

### 6.1 Graph

```
HTMLAudioElement (or MediaStream for mic)
   └─▶ MediaElementAudioSourceNode
        └─▶ BiquadFilter (lowshelf  @ 200 Hz)
             └─▶ BiquadFilter (peaking   @ 1 kHz, Q 1)
                  └─▶ BiquadFilter (highshelf @ 4 kHz)
                       └─▶ GainNode (master)
                            └─▶ AnalyserNode (fftSize 2048, smoothing 0.8)
                                 └─▶ AudioDestinationNode
```

### 6.2 Public API

```ts
class AudioEngine {
  init(): void                                  // create context + graph lazily
  loadFile(file: File): Promise<TrackMeta>      // object URL → <audio>.src
  loadUrl(url: string): Promise<TrackMeta>
  play(): Promise<void>
  pause(): void
  seek(seconds: number): void
  setGain(value: number): void                  // 0..2
  setEqBand(band: EqBandId, db: number): void   // -12..12
  setPlaybackRate(rate: number): void           // 0.5..2
  setFftSize(size: FftSize): void
  setSmoothing(value: number): void
  getFrequencyData(out: Uint8Array): void       // fills a reused buffer
  getTimeDomainData(out: Uint8Array): void
  getBands(): BandEnergy                        // { bass, mid, treble, level }
  dispose(): void                               // revoke URLs, disconnect, close ctx
}
```

### 6.3 Implementation notes

- Use `audio.preservesPitch = true` so speed changes don't chipmunk the vocals (toggle to allow "tape-style" pitch shift).
- Parameter changes use `param.setTargetAtTime(value, ctx.currentTime, 0.015)` to avoid zipper noise.
- `createMediaElementSource` can only be called **once per element**, so keep one long-lived `<audio>` element and change its `src`.
- Revoke previous `URL.createObjectURL` values on track change.
- Typed arrays (`Uint8Array(analyser.frequencyBinCount)`) are allocated once and reallocated only when FFT size changes.
- `getBands()` averages ranges of FFT bins (bass ≈ 20–250 Hz, mid ≈ 250 Hz–4 kHz, treble ≈ 4–16 kHz) based on `sampleRate / fftSize`.

---

## 7. Render Loop & Visualizers

### 7.1 `useVisualizerLoop` hook

A single hook owns the canvas lifecycle:

```ts
function useVisualizerLoop(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let raf = 0;
    let last = performance.now();

    const resize = new ResizeObserver(() => fitCanvasToDisplay(canvas, ctx)); // DPR-aware
    resize.observe(canvas);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab-switch
      last = now;
      const { mode, theme, settings } = useVisualizerStore.getState(); // transient read
      engine.sample();                                                  // fill buffers
      visualizers[mode].draw({ ctx, width, height, dt, theme, settings, audio: engine.frame });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); resize.disconnect(); };
  }, [canvasRef]);
}
```

Key points: the loop starts **once**; settings are read with `getState()` each frame, so changing a slider does not recreate the effect. The loop pauses when `document.hidden` and idles (slow fade) when the track is paused.

### 7.2 Visualizer plugin interface

```ts
interface Visualizer {
  id: VisualizerMode;
  label: string;
  init?(size: Size): void;                    // allocate pools, e.g. particles
  resize?(size: Size): void;
  draw(args: DrawArgs): void;
  dispose?(): void;
}
```

New visualizers register in `src/visualizers/index.ts`. Nothing else needs to change.

### 7.3 Built-in visualizers

| Visualizer | Data | Technique |
| --- | --- | --- |
| **Waveform** | Time-domain | Path through samples, mirrored ghost trail via low-alpha fade fill, glow via `shadowBlur` (toggleable; it is expensive) |
| **Frequency Bars** | Frequency (log-scaled bins) | Bars grouped into N bands, eased with lerp, peak caps that fall with gravity, theme gradient built once and cached |
| **Particle Spectrum** | Bands + beat | Fixed-size particle pool (no per-frame allocation); bass spawns radial bursts, treble drives sparkle, mids drive hue shift |

### 7.4 Beat detection

Rolling average of bass energy over about 1 s; a beat fires when `bass > avg * threshold` and the cooldown has elapsed. It exposes `frame.beat` (boolean) and `frame.beatStrength` to visualizers.

---

## 8. State Management (Zustand)

Stores live in `src/store/`. Each store uses a typed slice, selectors, and the `subscribeWithSelector` middleware where the engine must react.

### 8.1 `usePlaybackStore`

```ts
interface PlaybackState {
  status: "idle" | "loading" | "ready" | "playing" | "paused" | "error";
  track: TrackMeta | null;          // name, source ("file" | "preset" | "mic"), duration
  currentTime: number;              // throttled updates only
  duration: number;
  loop: boolean;
  error: string | null;
  // actions
  setTrack(t: TrackMeta | null): void;
  setStatus(s: PlaybackState["status"]): void;
  setTime(t: number): void;
  toggleLoop(): void;
}
```

### 8.2 `useAudioStore` (persisted)

```ts
interface AudioState {
  volume: number;        // 0..1 UI volume
  muted: boolean;
  gain: number;          // 0..2 master gain
  speed: number;         // 0.5..2
  preservePitch: boolean;
  eq: Record<EqBandId, number>;   // dB per band
  setGain(v: number): void;
  setSpeed(v: number): void;
  setEqBand(id: EqBandId, db: number): void;
  resetEq(): void;
  applyEqPreset(p: EqPreset): void;
}
```

The engine wires itself with `useAudioStore.subscribe(selector, apply, { fireImmediately: true })` in `src/audio/bindEngineToStore.ts`.

### 8.3 `useVisualizerStore` (persisted)

```ts
interface VisualizerState {
  mode: "waveform" | "bars" | "particles";
  themeId: ThemeId;
  settings: {
    fftSize: 512 | 1024 | 2048 | 4096;
    smoothing: number;      // 0..0.99
    sensitivity: number;    // 0.5..3
    barCount: number;
    particleCount: number;
    glow: boolean;
    mirror: boolean;
  };
  setMode(m: VisualizerMode): void;
  setTheme(id: ThemeId): void;
  updateSettings(patch: Partial<VisualizerState["settings"]>): void;
}
```

### 8.4 `useUiStore` and `useSavedPresetsStore`

- `useUiStore`: panel open/closed, fullscreen, controls-visible (auto-hide), active settings tab.
- `useSavedPresetsStore` (persisted): user-saved `{ id, name, eq, themeId, mode, settings }` combos, with add / rename / delete / apply.

### 8.5 Zustand conventions

- Components subscribe with **narrow selectors** (`useAudioStore(s => s.gain)`); use `useShallow` for multi-field picks.
- Never subscribe to `currentTime` outside the seek bar / time display components.
- `persist` uses `partialize` so transient fields (`status`, `track`, `currentTime`) are not saved, plus a `version` and `migrate`.

---

## 9. Server State (TanStack Query)

TanStack Query is used **only where there is truly remote or async data**. It is not used for UI or playback state.

| Query / Mutation | Purpose | Config |
| --- | --- | --- |
| `usePresetTracks()` | Fetch the preset manifest `/presets/manifest.json` (id, title, artist, url, license, bpm, suggested theme) | `staleTime: Infinity`, `gcTime: 1h`, typed with a Zod schema (optional) |
| `usePresetAudio(trackId)` | Fetch and validate the preset audio (blob) before handing the object URL to the engine; shows progress and handles failure | `enabled` only after the user selects a preset; `retry: 2`; the object URL is revoked on cleanup |
| `useLoadPreset()` (mutation) | Orchestrates "select preset → fetch → `engine.loadUrl` → autoplay" with loading and error states | `onError` surfaces a toast and sets playback `error` |
| *(stretch)* `useSharedPreset(id)` | Fetch a shared settings preset from a URL or gist | |

Setup in `main.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
</QueryClientProvider>
```

Query keys are centralized in `src/api/queryKeys.ts` (`presetKeys.all`, `presetKeys.audio(id)`).

---

## 10. Types

Central types in `src/types/`:

```ts
type VisualizerMode = "waveform" | "bars" | "particles";
type ThemeId = "neon" | "sunset" | "ocean" | "mono" | "aurora";
type EqBandId = "low" | "mid" | "high";   // widens to 10 bands later
type FftSize = 512 | 1024 | 2048 | 4096;

interface TrackMeta {
  id: string;
  name: string;
  artist?: string;
  source: "file" | "preset" | "mic";
  duration: number;
}

interface PresetTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  license: string;
  bpm?: number;
  suggestedTheme?: ThemeId;
}

interface BandEnergy { bass: number; mid: number; treble: number; level: number } // 0..1

interface AudioFrame {
  freq: Uint8Array;
  wave: Uint8Array;
  bands: BandEnergy;
  beat: boolean;
  beatStrength: number;
}

interface Theme {
  id: ThemeId;
  label: string;
  background: string;
  colors: string[];       // gradient stops
  accent: string;         // also mapped to a CSS variable for the UI
}

interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  width: number;          // CSS pixels (the context is pre-scaled by DPR)
  height: number;
  dt: number;
  theme: Theme;
  settings: VisualizerState["settings"];
  audio: AudioFrame;
}
```

---

## 11. Project Structure

```
audio-visualizer/
├── context/
│   └── project-overview.md
├── public/
│   └── presets/
│       ├── manifest.json
│       └── *.mp3
├── src/
│   ├── main.tsx                    # QueryClientProvider, root render
│   ├── App.tsx                     # layout shell
│   ├── index.css                   # @import "tailwindcss"; theme tokens
│   ├── api/
│   │   ├── queryKeys.ts
│   │   ├── presets.ts              # fetchers
│   │   └── hooks.ts                # usePresetTracks, usePresetAudio, useLoadPreset
│   ├── audio/
│   │   ├── AudioEngine.ts          # singleton, Web Audio graph
│   │   ├── bindEngineToStore.ts    # store → engine subscriptions
│   │   ├── bands.ts                # bin-range / energy helpers
│   │   └── beatDetector.ts
│   ├── visualizers/
│   │   ├── index.ts                # registry
│   │   ├── waveform.ts
│   │   ├── bars.ts
│   │   ├── particles.ts
│   │   └── themes.ts
│   ├── store/
│   │   ├── playbackStore.ts
│   │   ├── audioStore.ts
│   │   ├── visualizerStore.ts
│   │   ├── uiStore.ts
│   │   └── savedPresetsStore.ts
│   ├── hooks/
│   │   ├── useVisualizerLoop.ts
│   │   ├── useCanvasSize.ts
│   │   ├── useAudioEvents.ts       # <audio> events → throttled store updates
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useFullscreen.ts
│   ├── components/
│   │   ├── VisualizerCanvas.tsx
│   │   ├── DropZone.tsx
│   │   ├── PlayerControls.tsx
│   │   ├── SeekBar.tsx
│   │   ├── TimeDisplay.tsx
│   │   ├── EqPanel.tsx
│   │   ├── MixerPanel.tsx          # gain, speed, volume
│   │   ├── VisualizerPicker.tsx
│   │   ├── ThemePicker.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── PresetLibrary.tsx       # TanStack Query-driven
│   │   ├── SavedPresets.tsx
│   │   └── ui/                     # shadcn/ui generated: button, slider, tabs, tooltip, sheet, sonner...
│   ├── lib/
│   │   ├── utils.ts                # cn() (shadcn)
│   │   ├── format.ts               # mm:ss, dB
│   │   └── validateAudioFile.ts
│   └── types/
│       └── index.ts
├── vite.config.ts
├── tsconfig*.json
└── package.json
```

---

## 12. UI / UX

### 12.1 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header: logo · track title                       [Fullscreen] [Theme] │
├────────────────────────────────────────────┬─────────────────────────┤
│                                            │  Tabs: Mixer | EQ |     │
│                                            │        Visual | Presets │
│            <canvas> visualizer             │                         │
│     (drop-zone overlay when no track)      │  Sliders & controls     │
│                                            │                         │
├────────────────────────────────────────────┴─────────────────────────┤
│ ⏮ ▶ ⏭   0:42 ━━━━━●━━━━━━━━━ 3:18   🔊 ━━●━   1.0x   🔁            │
└──────────────────────────────────────────────────────────────────────┘
```

- **Desktop:** canvas fills the main area; control panel is a right sidebar (collapsible).
- **Mobile:** canvas on top; controls in a bottom sheet with tabs; the player bar is sticky.
- **Fullscreen:** controls fade out after 3 s of inactivity and return on mouse move.

### 12.2 Visual design

- Dark-first (`bg-neutral-950`), glass-style panels (`bg-white/5 backdrop-blur border border-white/10`).
- Accent color is a CSS variable set from the active theme (`--accent`), so UI chrome and canvas stay in sync.
- Smooth micro-interactions (hover, slider thumb glow); respect `prefers-reduced-motion` (reduce particle count and disable glow).

### 12.3 States to design for

| State | Behavior |
| --- | --- |
| Empty | Large drop zone with "Drop a track or pick a preset"; ambient idle animation on the canvas |
| Drag-over | Highlighted outline, "Release to play" |
| Loading | Skeleton / progress for preset audio |
| Error | Inline toast: unsupported format, decode failure, network failure with retry |
| Paused | Visualizer eases to rest rather than freezing abruptly |
| Mic permission denied | Explains how to re-enable |

### 12.4 Accessibility

- All controls keyboard operable; sliders have labels, `aria-valuetext` (e.g. "+4 dB").
- Visible focus rings; canvas has `role="img"` and an `aria-label` that describes the current mode.
- Do not rely on color alone to convey state.
- Reduced-motion and high-contrast options.

---

## 13. Performance Rules

1. **No React state per frame.** The rAF loop reads typed arrays and `store.getState()`; it never calls `setState`.
2. **Canvas is memoized.** `VisualizerCanvas` renders once. Props that change often (mode, theme) are read from the store inside the loop, not passed as props.
3. **Allocate once.** Reuse `Uint8Array` buffers, particle pools, and gradients. Rebuild gradients only on resize or theme change.
4. **Throttle store writes** from audio events (`timeupdate` fires about 4 Hz anyway; the seek bar can interpolate with its own rAF if smoothness is needed).
5. **Narrow selectors** and `React.memo` on panels; sliders use local drag state and commit on change.
6. **DPR-aware but capped** (`Math.min(devicePixelRatio, 2)`) to bound fill cost.
7. **Pause when hidden.** Stop the loop on `visibilitychange`, and clamp `dt`.
8. **Expensive effects are optional.** `shadowBlur` glow is off by default on low-power devices.
9. **Measure.** Use the Chrome Performance panel and a dev-only FPS meter; target a steady 60 fps at 1080p with 2048 FFT.

---

## 14. Development Rules

- **Single page app, client only:** no routing framework is needed (one screen); add React Router only if more pages appear. Remote data is limited to static files in `public/` (and optional external URLs) fetched with TanStack Query.
- **TypeScript strict**, no `any`; prefer discriminated unions for status.
- **Audio engine and visualizers stay React-free** so they are unit-testable.
- **Components are small and presentational**; logic lives in hooks, stores, or the engine.
- **Tailwind + shadcn/ui** for styling and UI: use shadcn components (`npx shadcn@latest add ...`) instead of hand-rolling buttons, sliders, tabs, tooltips and toasts; customize through Tailwind classes and theme tokens in `index.css`. Use `cn()` from `@/lib/utils` for conditional classes. No inline style objects except for dynamic values (such as canvas size).
- **shadcn Slider caveat:** it is a controlled Radix slider; keep drag state local and commit to Zustand via `onValueChange` (live parameters) or `onValueCommit` (expensive ones such as FFT size). Never wire the seek bar to per-frame time updates.
- **File naming:** `PascalCase.tsx` for components, `camelCase.ts` for modules, `useX.ts` for hooks.
- **Cleanup everything:** every `useEffect` that starts a loop, listener, or observer returns a cleanup. `dispose()` the engine on HMR (`import.meta.hot?.dispose`).
- **Handle StrictMode:** the effects must survive double-mount in dev (the engine singleton + idempotent `init()`).
- **Commits:** small and conventional (`feat:`, `fix:`, `refactor:`, `perf:`).
- **Testing priorities:** `bands.ts`, `beatDetector.ts`, store reducers and migrations, `validateAudioFile`, format helpers.

---

## 15. Roadmap

| Phase | Scope |
| --- | --- |
| **0. Setup** | Tailwind v4, shadcn/ui init, Zustand, TanStack Query, folder structure, base layout shell |
| **1. Audio core** | `AudioEngine`, file drop, play/pause/seek, volume, time display |
| **2. Canvas loop** | `useVisualizerLoop`, DPR resize, Waveform visualizer |
| **3. More visuals** | Frequency Bars + Particle Spectrum, theme system, visualizer picker |
| **4. Mixer & EQ** | Gain, 3-band EQ, playback speed, store → engine binding |
| **5. Presets (TanStack Query)** | Preset manifest, preset audio loading, loading and error UI |
| **6. Polish** | Settings panel, persistence, shortcuts, fullscreen, saved presets, a11y, mobile |
| **7. Performance pass** | Profiling, FPS meter, reduced-motion, low-power mode |
| **7b. Deploy** | Vite `base`, `BASE_URL`-aware asset paths, GitHub Actions workflow to Pages |
| **8. Stretch** | Mic input, recording, 10-band EQ, shareable links, OffscreenCanvas |

### Definition of done (MVP)

- Drop an MP3 and see it visualized within 1 s.
- Three visualizers switch live with no audio glitch.
- Gain, 3-band EQ, speed and theme change take effect in real time.
- Zero React re-renders per frame (verified with React DevTools Profiler).
- Preset tracks load via TanStack Query with loading and error states.
- Works in the latest Chrome, Firefox, Safari and Edge; usable on mobile.

---

### Deployment (GitHub Pages)

The app is hosted as static files on GitHub Pages at `https://<user>.github.io/<repo>/`.

- **Vite base path:** set `base: "/<repo>/"` in `vite.config.ts` (use `"/"` only for a custom domain or a `<user>.github.io` repo).
- **Public asset URLs:** never hardcode `/presets/...`. Build them with `import.meta.env.BASE_URL` (e.g. `` `${import.meta.env.BASE_URL}presets/manifest.json` ``), otherwise fetches 404 under the repo subpath.
- **No client-side routing needed:** it is a single screen, so Pages' lack of SPA rewrites is not a problem. If React Router is added later, use `HashRouter` or a `404.html` redirect.
- **Deploy via GitHub Actions** (Settings → Pages → Source: GitHub Actions) using `actions/configure-pages`, `actions/upload-pages-artifact` (path `dist`) and `actions/deploy-pages`, triggered on push to `main` after `npm ci && npm run lint && npm test && npm run build`.
- **Static only:** no secrets in the client; Pages serves over HTTPS, so `getUserMedia` (mic) and `AudioContext` work as expected.
- **Audio hosting: bundled.** Preset tracks are committed to `public/presets/` and served by Pages alongside the app, so there is no external dependency or CORS to worry about (important: `AnalyserNode` returns silence for cross-origin audio without CORS headers).
  - Budget: 3-5 tracks, ≈ 128 kbps MP3, 30-90 s clips, under 2 MB each (about 10 MB total). Pages caps the site at 1 GB.
  - Use only royalty-free or CC0/CC-BY tracks; record title, artist, license and source URL in `manifest.json` and show attribution in the UI.
  - Files in `public/` are not hashed, so renaming a track means a new filename to avoid stale caches.
  - Fetch them through TanStack Query only when the user selects a preset (not at startup), so the initial load stays light.

---

## 16. Open Questions

1. Which royalty-free tracks to bundle (size vs. variety)? Consider ≤ 3 short tracks (< 5 MB each) or hosting externally.
2. Mic input in the MVP, or defer to enhanced scope?
3. Is `preservePitch` on by default, or should speed be "tape-style"?
4. Should the 3-band EQ go straight to 10 bands?
5. ~~Hosting target~~ **Decided: GitHub Pages** (see [Deployment](#deployment-github-pages)). ~~Preset audio~~ **Decided: bundle it in the repo** under `public/presets/`. Fall back to external hosting only if the tracks outgrow the size budget below.
6. Which shadcn base color and style to start from (neutral/zinc, "new-york")? The dark theme is the default.

---

## 17. Reference Links

- Web Audio API: https://developer.mozilla.org/docs/Web/API/Web_Audio_API
- AnalyserNode: https://developer.mozilla.org/docs/Web/API/AnalyserNode
- BiquadFilterNode: https://developer.mozilla.org/docs/Web/API/BiquadFilterNode
- Canvas API: https://developer.mozilla.org/docs/Web/API/Canvas_API
- Canvas optimization: https://developer.mozilla.org/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- Autoplay policy: https://developer.mozilla.org/docs/Web/Media/Guides/Autoplay
- Zustand: https://zustand.docs.pmnd.rs
- TanStack Query: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui (Vite install): https://ui.shadcn.com/docs/installation/vite
- Vite: https://vite.dev
- Vite static deploy (GitHub Pages): https://vite.dev/guide/static-deploy.html#github-pages
