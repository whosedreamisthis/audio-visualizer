# Player Controls

## Overview

The bottom player bar: transport, seek bar, time display, volume, speed readout and loop.

## Goals

- [ ] `PlayerControls` container using shadcn Button, Slider, Tooltip
- [ ] Play/pause toggle reflecting `status` (disabled with no track)
- [ ] `SeekBar` (shadcn Slider): shows progress, seeks on commit; while dragging, shows the drag position locally without fighting store updates
- [ ] `TimeDisplay`: `current / duration` using `formatTime`; the only component subscribed to `currentTime` besides the seek bar
- [ ] Volume slider + mute button (mute remembers the previous volume)
- [ ] Loop toggle
- [ ] Track title and source badge (file / preset / mic)
- [ ] Icons from `lucide-react`, each icon-only button has an `aria-label` and tooltip
- [ ] When the track ends: status → paused at 0:00 (or restart if loop is on)

## Requirements

- Slider `aria-valuetext` such as "1:05 of 3:18" and "Volume 70%"
- Controls remain usable on mobile (44 px touch targets, sticky bar)
- No per-frame updates: time comes from throttled store updates

## Acceptance Criteria

- Play/pause, seek, volume, mute and loop all work during playback
- Seeking while paused updates the time display
- Controls are disabled gracefully with no track loaded
