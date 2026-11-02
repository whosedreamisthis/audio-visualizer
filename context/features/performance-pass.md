# Performance Pass

## Overview

Profile and tune the render loop and React tree so the app holds a steady 60 fps.

## Goals

- [ ] Dev FPS/frame-time meter (toggle with a key or `?fps` query param)
- [ ] Verify with React DevTools Profiler that nothing re-renders per frame while audio plays
- [ ] Audit store selectors; add `useShallow` where multi-field picks exist; memoize panels with `React.memo`
- [ ] Chrome Performance profile at 1080p, FFT 2048: no long frames, no GC spikes (allocation timeline flat)
- [ ] Adaptive quality: if average frame time exceeds about 20 ms for 2 s, reduce particle count / disable glow and show a small notice (with a "high quality" override)
- [ ] Lazy-load below-the-fold UI (settings panel, shortcut dialog) with `React.lazy`
- [ ] Bundle check: `vite build` size report; avoid pulling in unused icon sets or libraries
- [ ] Ensure the loop is paused when the tab is hidden and when the canvas is off-screen
- [ ] Throttled store writes confirmed (time updates ≤ 10 Hz)

## Requirements

- Record before/after numbers in the PR/commit message
- Target: 60 fps at 1080p with default settings on a mid-range laptop; JS bundle under about 250 kB gzipped

## Acceptance Criteria

- Profiler shows zero React commits per frame during playback
- Heap snapshot is stable after 5 minutes of playback
