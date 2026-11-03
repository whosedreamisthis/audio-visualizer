# Current Feature: Accessibility

Make the studio usable with keyboard, screen readers and reduced-motion preferences.

## Status

In Progress

## Goals

- Every control reachable and operable by keyboard with visible focus rings
- All sliders labelled, with `aria-valuetext` (e.g. "+4 dB", "1.25x", "1:05 of 3:18")
- Icon-only buttons have `aria-label`; tooltips are also shown on focus
- Canvas: `role="img"` and a dynamic `aria-label` ("Frequency bars visualizer, playing")
- Live region (`aria-live="polite"`) announces track loaded, playing/paused, errors
- State never conveyed by color alone (active mode/theme has a ring/check, mute shows an icon)
- `prefers-reduced-motion`: lower particle count, no glow, calmer idle animation, no flashing on beats
- Respect `prefers-contrast` where practical; text contrast meets WCAG AA on all themes
- Skip link to the player controls
- Warn about flashing: beat pulse limited to safe brightness changes (no more than 3 flashes per second)

## Notes

- Test with keyboard only and a screen reader (NVDA/VoiceOver) at least once
- Dialogs and sheets trap focus and restore it on close (shadcn/Radix default; verify)
- Acceptance: Lighthouse accessibility score ≥ 95
- Acceptance: a full flow (load preset, change EQ, switch visualizer, fullscreen) is possible without a mouse

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Project Setup:** Vite SPA with Tailwind v4, shadcn/ui, Zustand, TanStack Query, Vitest and a dark layout shell; key files `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Responsive Layout:** Static studio UI with header, canvas stage and drop zone, tabbed control panel, player bar, and sheets below 1024 px; key files `src/App.tsx`, `src/components/`.
- **Types and Constants:** Shared types, audio constants, math and format helpers with Vitest tests; key files `src/types/index.ts`, `src/lib/constants.ts`, `math.ts`, `format.ts`.
- **Audio Engine:** React-free Web Audio engine (3-band EQ, gain, analyser, typed events and errors) plus band energy helpers; key files `src/audio/AudioEngine.ts`, `bands.ts`, `engine.ts`.
- **State Stores:** Zustand playback, audio, visualizer and UI stores with sanitized persistence, store-to-engine binding and throttled engine events; key files `src/store/`, `src/audio/bindEngineToStore.ts`.
- **File Drop Zone:** Drag and drop or pick an audio file to load and autoplay it, with validation, drag-over overlay and error toasts; key files `src/lib/validateAudioFile.ts`, `src/audio/loadAudioFile.ts`, `src/hooks/useFileDrop.ts`, `src/components/CanvasStage.tsx`.
- **Player Controls:** Working player bar with play/pause, seek, time, volume/mute, loop, restart and track info; key files `src/audio/transport.ts`, `src/components/PlayerBar.tsx`, `SeekBar.tsx`, `VolumeControl.tsx`.
- **Canvas Render Loop:** Single rAF loop drawing a live spectrum on a DPR-aware canvas, with beat detection, visualizer registry, themes data and FPS meter; key files `src/hooks/useVisualizerLoop.ts`, `src/audio/frameSampler.ts`, `src/visualizers/`.
- **Waveform Visualizer:** Oscilloscope line with fading trail, gradient, mirror, glow, beat pulse and idle breathing, plus a working mode toggle; key files `src/visualizers/waveform.ts`, `waveformMath.ts`, `src/components/panels/VisualPanel.tsx`.
- **Frequency Bars Visualizer:** Centered log-spaced spectrum bars (bass in the middle) with eased heights, vertical mirror, beat pulse and small-canvas reduction; key files `src/visualizers/bars.ts`, `barsMath.ts`.
- **Visualizer Settings:** Visual tab with live FFT size, smoothing, sensitivity, count, line width, glow and mirror controls plus reset; bars gain glow and idle ripple; key files `src/components/panels/SettingsPanel.tsx`, `VisualPanel.tsx`.
- **Particle Visualizer:** Particle spectrum mode with a fixed pool, beat bursts, level-driven stream, mid color shift, treble sparkles and soft glowing orbs; key files `src/visualizers/particles.ts`, `particlesMath.ts`.
- **Visualizer Picker and Themes:** Extracted mode and theme pickers with tooltips, swatches from typed theme data, and theme accent applied to shadcn tokens with AA contrast; key files `src/components/VisualizerPicker.tsx`, `ThemePicker.tsx`, `src/hooks/useApplyTheme.ts`.
- **Mixer Panel:** Mixer tab with working gain (0-200%, clipping warning), speed slider and chips, and preserve-pitch switch bound to the audio store; key files `src/components/panels/MixerPanel.tsx`, `ControlRow.tsx`.
- **Equalizer:** EQ tab with three live band sliders, signed dB readouts, presets with Custom detection, reset, bypass and a response curve; key files `src/components/panels/EqPanel.tsx`, `src/lib/eqCurve.ts`.
- **Keyboard Shortcuts and Fullscreen:** Global key shortcuts, page fullscreen with auto-hiding controls and cursor, `?` help dialog and HUD toasts; key files `src/lib/shortcuts.ts`, `src/hooks/useKeyboardShortcuts.ts`, `useFullscreen.ts`.
- **Preset Library:** Manifest-driven preset tracks loaded on demand via TanStack Query, with clickable cards, skeletons and Retry; key files `src/api/presets.ts`, `hooks.ts`, `src/components/PresetLibrary.tsx`.
- **Microphone Input:** Live microphone as a source with a speaker-monitor gate, permission help and live-aware controls; key files `src/audio/AudioEngine.ts`, `mic.ts`, `src/store/micStore.ts`, `src/components/MicInput.tsx`.
- **Saved Presets:** Named snapshots of EQ, gain, speed, theme, mode and visualizer settings with rename, undo delete, JSON import/export and reset all; key files `src/store/savedPresetsStore.ts`, `src/components/SavedPresets.tsx`, `src/lib/resetSettings.ts`.
