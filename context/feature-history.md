
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

- **Audio Engine:** Added the React-free Web Audio layer that later features (stores, drop zone, render loop) build on; not yet called from the UI.
  - `src/audio/AudioEngine.ts`: owns the `<audio>` element and graph source → low shelf (200 Hz) → mid peaking (1 kHz) → high shelf (4 kHz) → gain → analyser → destination. Lazy idempotent `init()`; `loadFile` / `loadUrl` resolve with `TrackMeta`; `play` (resumes context, maps `NotAllowedError` to `autoplay-blocked`), `pause`, `seek`, `setLoop`, `setPlaybackRate`, `setPreservePitch`, `setVolume`, `setMuted`, `setGain`, `setEqBand`, `setFftSize`, `setSmoothing`, `getFrequencyData`, `getTimeDomainData`, `getBands`, typed `on()` events, `dispose()`.
  - Typed `AudioEngineError` codes: `not-initialized`, `autoplay-blocked`, `unsupported-format`, `load-failed`. Parameters are clamped to shared constants and changed with `setTargetAtTime`; object URLs are revoked on track change and dispose.
  - Browser dependencies are injected through `EngineEnv`, so tests use fakes. `src/audio/engine.ts` provides the lazy singleton `getAudioEngine()` with HMR dispose.
  - `src/audio/bands.ts`: `binToFrequency`, `frequencyToBin`, `rangeEnergy`, `getBandEnergy`.
  - Tests: `bands.test.ts` and `AudioEngine.test.ts` (22 tests; 38 total). Real audio output still needs a check by ear once the UI is wired.

- **State Stores:** Added the Zustand state layer and wired it to the audio engine; the UI controls are still static and get connected by later features.
  - `src/store/playbackStore.ts` (status, track, time, duration, loop, error; `setError` moves to `error`, `reset` keeps `loop`), `audioStore.ts` (volume, muted, gain, speed, preservePitch, per-band EQ, eqBypass; persisted as `av-audio`), `visualizerStore.ts` (mode, theme, settings; persisted as `av-visualizer`), `uiStore.ts` (sidebar, controls sheet, tab, fullscreen; only `sidebarOpen` persisted as `av-ui`). All setters clamp to the shared constants.
  - Persistence uses `version: 1`, `partialize`, and `migrate`/`merge` that run `sanitize*` functions so corrupted or outdated data falls back to valid defaults; `src/lib/safeStorage.ts` falls back to in-memory storage when localStorage is unavailable. Helpers: `src/lib/sanitize.ts`, `throttle.ts`, `eqPresets.ts` (Flat, Bass Boost, Vocal, Treble, Lo-Fi), plus new visualizer constants.
  - `src/audio/bindEngineToStore.ts` applies store values to the engine through per-field selector subscriptions (EQ uses `shallow`, flat while bypassed) and re-applies everything on the new engine `initialized` event; the engine gained `isInitialized`.
  - `src/hooks/useAudioEvents.ts` mirrors engine events into the playback store (time throttled to about 10 Hz); `App.tsx` mounts it and the binding.
  - Tests: 36 new (74 total) covering store clamping, presets, sanitize/migrate/merge, binding with a mocked engine, throttle and EQ presets.

- **File Drop Zone:** Users can now drop or pick an audio file and hear it play through the engine (first feature with audible output).
  - `src/lib/validateAudioFile.ts`: rejects empty and oversized (over 100 MB) files; accepts a known audio extension or MIME type (browsers sometimes leave `type` empty); messages name the file. New `ACCEPTED_AUDIO_MIME_TYPES` constant.
  - `src/hooks/useFileDrop.ts`: window-level dragenter/over/leave/drop with depth counting, only reacts to drags containing files, prevents the browser navigating to the file.
  - `src/audio/loadAudioFile.ts`: `loadAudioFile` validates, sets status `loading`, calls `engine.init()` inside the gesture, loads, sets the track and plays; blocked autoplay shows an info toast, other failures clear the track, set the error and toast. A load token ignores stale loads when a newer file arrives. `handleAudioFiles` picks the first valid file and toasts when others are ignored.
  - `src/components/CanvasStage.tsx`: hidden multi-file input behind the Choose file button, loading spinner state, "Release to play" overlay, card hidden once a track is loaded.
  - Tests: 9 new for `validateAudioFile` (83 total). Playback controls and the real visualizer are not wired yet; the preset button stays inert until the preset library.

- **Player Controls:** The player bar now controls playback instead of showing placeholders.
  - `src/audio/transport.ts`: `getTransportAction` (none without a track, pause while playing, play when ready/paused, none while loading or errored), `togglePlayback` (error toast on failure) and `seekTo` (engine seek plus immediate store time); both accept an injected engine for tests.
  - `src/components/PlayerBar.tsx`: play/pause tied to status, restart, loop toggle (`aria-pressed`), track title, artist and File/Preset/Mic badge, speed readout; previous/next removed (no playlist). `SeekBar.tsx` (local drag value, seeks on commit, `aria-valuetext` "1:05 of 3:18"), `TimeDisplay.tsx` (the only readers of `currentTime` besides the seek bar), `VolumeControl.tsx` (mute keeps the volume; dragging while muted unmutes).
  - Volume is shown at every width (title row on mobile). The slider needs a fixed-width wrapper in flex rows because the shadcn Slider is `w-full`.
  - `src/components/ui/slider.tsx` now forwards `aria-label` and `getAriaValueText` to the thumbs, which also labels the static panel sliders.
  - Tests: 11 new for transport (94 total).

- **Canvas Render Loop:** The static mock bars are replaced by a live canvas driven by the audio analyser; all three modes currently share a basic fallback spectrum until their dedicated visualizers are built.
  - `src/hooks/useVisualizerLoop.ts`: one `requestAnimationFrame` loop started once per canvas; reads mode, theme and settings with `getState()` each frame, reuses a single `DrawArgs` object, clamps `dt` to 0.05 s, pauses on `document.hidden`, and disposes/initializes visualizers on mode change. `src/components/VisualizerCanvas.tsx` renders once with `role="img"` and a mode-aware label; `FpsMeter.tsx` (dev only, `?fps`) updates the DOM directly.
  - `src/lib/canvas.ts` (`computeBackingSize`, `fitCanvasToDisplay`, DPR capped at 2), `src/audio/frameSampler.ts` (reused buffers, band energy and beat per frame, sample rate on the frame), `src/audio/beatDetector.ts` (exponential rolling bass average, threshold, floor and cooldown), `writeBandEnergy` in `bands.ts` (no allocation).
  - `src/visualizers/`: `themes.ts` (five theme palettes), `index.ts` registry, `fallback.ts` (basic bars with an ambient idle wave) and `spectrum.ts`: log-spaced bar edges (40 Hz to 12 kHz), `averageBins`, level compression, treble tilt, and adaptive per-bar scaling (decaying peak, strength 0.6) so quiet treble stays visible; shared with the upcoming bars visualizer.
  - Types: `AudioFrame` gains `sampleRate` and uses `ByteBuffer`; `DrawArgs` gains `time` and `playing`.
  - Tests: 39 new (133 total) for the beat detector, frame sampler, canvas sizing and spectrum helpers. Visual quality was tuned by eye over several iterations (right side was flat until log spacing, compression and adaptive scaling were added).

- **Waveform Visualizer:** The Waveform mode now has its own visualizer; Bars and Particles still use the shared fallback spectrum until their features are built.
  - `src/visualizers/waveform.ts`: smooth quadratic-curve line through the time-domain data, centered and scaled by `settings.sensitivity`, drawn with a theme gradient cached per theme and width; trail by filling the background at low alpha each frame (stronger fade when idle); optional mirrored line at 35% alpha (`settings.mirror`); glow through `shadowBlur` only when `settings.glow` is on; beat pulse widens the line and swells the glow; idle breathing sine that eases out with an `activity` value tracking play state. No allocation in `draw` (points array and gradient reused); the line is clamped inside the canvas.
  - `src/visualizers/waveformMath.ts`: `waveformPointCount` (about one point per 2 px, minimum 8), `byteToUnit`, `fillWaveformPoints` (evenly spaced sampling; silence and missing data map to the center).
  - Registered in `src/visualizers/index.ts`; the Visual tab's visualizer mode toggle in `VisualPanel.tsx` now reads and sets `visualizerStore.mode` (first piece of the picker feature).
  - Tests: 14 new (147 total): point math plus a smoke test of the draw routine against a fake canvas (registration, mirror, glow, empty data, zero-size canvas, gradient reuse). Mirror, glow and line width controls are still static until `visualizer-settings`.

- **Frequency Bars Visualizer:** The Bars mode now has its own classic spectrum analyzer; only Particles still uses the shared fallback.
  - `src/visualizers/bars.ts`: bars grouped on log-spaced bin edges (reusing `computeBarEdges` and the shaping helpers in `spectrum.ts`), heights eased with fast attack (32/s) and slower release (9/s), falling to zero when paused. Drawn symmetrically around the center (lowest frequencies in the middle, each band drawn on both sides) as one batched path of rounded bars; no peak caps (removed after review feedback); gap is 22% of each bar slot. Mirror grows bars up and down from the vertical center with a symmetric gradient. Beat pulse adds about 12% height and a brightness boost. Gradient cached by theme, height and mirror; edges cached numerically. No per-frame allocation.
  - `src/visualizers/barsMath.ts`: `effectiveBarCount` (about 6 px minimum per bar, never below 4), `barLayout`.
  - Changing the bar count (slider or narrow window) resamples current heights, peaks into the new arrays instead of zeroing them, so bars do not flicker. Found in review.
  - Registered in `src/visualizers/index.ts`.
  - Tests: 15 new (162 total): log-edge monotonicity and coverage, bar count reduction, layout, peak cap physics, and draw smoke tests against a fake canvas (registration, mirror, beat pulse, live count change, paused settle, empty and zero-size canvas, gradient reuse). Visual and listening checks were not done in a browser.

- **Visualizer Settings:** The Visual tab now has live controls for how the visualizers analyze and draw, all bound to `visualizerStore.settings` (persisted).
  - `src/components/panels/SettingsPanel.tsx`: FFT size button group (512/1024/2048/4096, one click commits), sliders for smoothing, sensitivity, bar count, particle count and line width (applied while dragging, each with a per-row reset), glow and mirror switches, and a "Reset visual settings" button. Bar count, particle count and line width show only for bars, particles and waveform respectively.
  - `src/components/panels/VisualPanel.tsx`: static controls replaced by `SettingsPanel`; the theme picker now reads and sets the store, so the theme persists.
  - Store, persistence and engine binding (FFT size, smoothing) already existed from the State Stores feature; visualizers already read settings through `getState()` each frame, so nothing restarts the loop. Glow defaults to off.
  - `src/visualizers/bars.ts`: honors `settings.glow` (accent shadow, swells on beats, reset after fill) and draws a gentle outward ripple when idle instead of going blank. `src/visualizers/waveform.ts`: idle animation enlarged to two travelling ripples (about 8% of height) with edge-softened envelope.
  - Tests: `bars.test.ts` updated for the idle ripple (165 total). No new tests for the panel. Particle count has no visible effect until the particles visualizer exists; not checked in a browser by the assistant.

- **Particle Visualizer:** The Particles mode now has its own visualizer, so all three modes are built and the shared fallback is no longer used.
  - `src/visualizers/particles.ts`: fixed pool sized by `settings.particleCount` (reallocated when it changes), simulation scaled by `dt`, with drag and a slight swirl around the center. Beats burst from a ring with count and speed scaled by bass. A steady emitter driven by overall level keeps the field alive between beats (added after particles vanished when beat detection missed). Treble spawns short-lived white sparkles, mids slide color along the theme, and idle shows a few slow drifting particles. Particles are soft round sprites pre-rendered per theme color (plus white), shrinking and fading with life; a low-alpha background fill leaves the trail. Additive blending only when glow is on. Reduced motion caps the pool at 300 and disables additive blending (read at init and resize). Off-canvas particles are retired so the pool never grows.
  - `src/visualizers/particlesMath.ts`: struct-of-arrays `ParticlePool`, `spawn` (fills free slots only, rotating cursor), `stepPool`, `aliveCount`.
  - Registered in `src/visualizers/index.ts`; the particle count slider (100-3000, default 800) already existed.
  - Tests: 14 new (180 total): pool helper and a draw smoke suite against a fake canvas with stubbed `document` and `matchMedia`. 60 fps at 1080p, burst look and memory over several minutes were not verified in a browser. Known nits: spawn closures are created per frame; a stray `* 1` in the sparkle radius.
