# Microphone Input (Enhanced)

## Overview

Visualize live sound from the user's microphone as an alternative to a file.

## Goals

- [ ] "Use microphone" button in the empty state and the Presets tab
- [ ] `engine.useMicrophone()` using `getUserMedia({ audio })` and a `MediaStreamAudioSourceNode` into the same graph (EQ and analyser work; output to speakers is muted by default to avoid feedback)
- [ ] Switching back to a file/preset disconnects the mic source and stops all `MediaStream` tracks
- [ ] Permission handling: prompt, granted, denied (explains how to re-enable), no device available
- [ ] Playback controls adapt: seek/speed disabled for the live source; track badge shows "mic"
- [ ] "Monitor through speakers" switch with a feedback warning, off by default

## Requirements

- Requires HTTPS or localhost (satisfied by GitHub Pages)
- Tracks stopped on unmount, on source switch and when the tab closes
- Echo cancellation / noise suppression constraints turned off for accurate visuals (configurable)

## Acceptance Criteria

- Speaking or clapping drives the visualizers in real time
- Denying permission shows a helpful message and the app remains usable
- No lingering "recording" indicator in the browser after switching away
