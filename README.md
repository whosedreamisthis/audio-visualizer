# Audio Visualizer Studio

A browser-based studio where you drop in a song and watch it come alive: real-time waveforms, frequency bars and particle spectrums, with live control over gain, EQ, speed and themes. Everything runs client-side with the Web Audio API and Canvas.

## Features

- **Sources:** drag and drop or pick an audio file, load a bundled preset track, or use the live microphone (with a speaker-monitor gate and permission help).
- **Visualizers:** waveform oscilloscope, centered frequency bars and a particle spectrum, each with beat reactions, themes and a settings panel (FFT size, smoothing, sensitivity, counts, line width, glow, mirror).
- **Mixer and EQ:** gain up to 200% with a clipping warning, playback speed with pitch preservation, and a 3-band equalizer with presets, bypass and a response curve.
- **Saved presets:** save named snapshots of EQ, gain, speed, theme, mode and visualizer settings; rename, delete with undo, import/export as JSON, and reset all.
- **Player:** play/pause, seek, volume/mute, loop, restart and track info.
- **Keyboard and fullscreen:** global shortcuts, a fullscreen mode with auto-hiding controls, and a `?` help dialog.
- **Accessibility:** live announcements, skip link, reduced-motion and high-contrast support, and a cap of three beat flashes per second.
- **Performance:** a single `requestAnimationFrame` loop that never triggers React renders, pauses when the tab is hidden or the canvas is off-screen, and falls back to cheaper rendering if frames run slow (with a "High quality" override).

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `←` `→` | Seek 5 seconds back / forward |
| `↑` `↓` | Volume up / down |
| `M` | Mute |
| `L` | Loop |
| `F` | Fullscreen |
| `1` `2` `3` | Waveform / Bars / Particles |
| `P` | Performance meter (FPS) |
| `?` | Show shortcut help |

The FPS meter can also be enabled by loading the page with `?fps`.

## Tech stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Zustand, TanStack Query, Vitest.

## Getting started

```bash
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Lint with ESLint |

## Project structure

```
src/
  audio/        Web Audio engine, transport, mic, frame sampling, beat detection
  visualizers/  Waveform, bars and particles renderers, themes and registry
  store/        Zustand stores (playback, audio, visualizer, ui, mic, saved presets)
  hooks/        Render loop, keyboard shortcuts, fullscreen, file drop, theme
  components/   Canvas stage, player bar, control panels, pickers
  api/          Preset manifest fetching (TanStack Query)
  lib/          Constants, math, formatting, shortcuts, frame budget helpers
  types/        Shared types
public/
  presets/      Bundled preset tracks and manifest.json
context/        Project overview, coding standards and feature specs/history
```

See [context/project-overview.md](context/project-overview.md) for the full design and [context/coding-standards.md](context/coding-standards.md) for conventions.

## Notes

- Audio is decoded and played in the browser; nothing is uploaded.
- Settings, theme and saved presets persist in `localStorage`.
- Microphone access needs a secure context (HTTPS or `localhost`) and the user's permission.
