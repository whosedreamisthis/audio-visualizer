# Accessibility

## Overview

Make the studio usable with keyboard, screen readers and reduced-motion preferences.

## Goals

- [ ] Every control reachable and operable by keyboard with visible focus rings
- [ ] All sliders labelled, with `aria-valuetext` (e.g. "+4 dB", "1.25x", "1:05 of 3:18")
- [ ] Icon-only buttons have `aria-label`; tooltips are also shown on focus
- [ ] Canvas: `role="img"` and a dynamic `aria-label` ("Frequency bars visualizer, playing")
- [ ] Live region (`aria-live="polite"`) announces track loaded, playing/paused, errors
- [ ] State never conveyed by color alone (active mode/theme has a ring/check, mute shows an icon)
- [ ] `prefers-reduced-motion`: lower particle count, no glow, calmer idle animation, no flashing on beats
- [ ] Respect `prefers-contrast` where practical; text contrast meets WCAG AA on all themes
- [ ] Skip link to the player controls
- [ ] Warn about flashing: beat pulse limited to safe brightness changes (no more than 3 flashes per second)

## Requirements

- Test with keyboard only and a screen reader (NVDA/VoiceOver) at least once
- Dialogs and sheets trap focus and restore it on close (shadcn/Radix default; verify)

## Acceptance Criteria

- Lighthouse accessibility score ≥ 95
- A full flow (load preset, change EQ, switch visualizer, fullscreen) is possible without a mouse
