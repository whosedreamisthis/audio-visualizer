# File Drop Zone

## Overview

Let users drag and drop an audio file onto the app (or use a file picker) to load it into the engine and start playback.

## Goals

- [ ] `src/lib/validateAudioFile.ts`: validates MIME type/extension (`.mp3 .wav .ogg .flac .m4a`) and max size (e.g. 100 MB); returns `{ ok: true } | { ok: false, reason }`
- [ ] `DropZone` component: full-canvas overlay in the empty state, "Drop a track or pick a preset"
- [ ] Drag-over state: highlighted outline and "Release to play"
- [ ] File picker button (hidden `<input type="file" accept="audio/*">`) as a keyboard-accessible alternative
- [ ] Window-level drop handling so dropping anywhere works; prevent the browser from navigating to the file
- [ ] On valid drop: `engine.init()`, `loadFile`, set track in the store, autoplay
- [ ] On invalid file or decode failure: sonner toast with a clear reason; state returns to idle
- [ ] Loading state while metadata loads
- [ ] Multiple files dropped: use the first valid one and mention the rest are ignored

## Requirements

- The user gesture (drop/click) is used to create and resume the `AudioContext`
- Track name derived from the file name (strip extension)
- Object URLs revoked when the track is replaced

## Tests (Vitest)

- `validateAudioFile`: valid types, wrong type, empty file, oversized, uppercase extension, missing MIME type with valid extension

## Acceptance Criteria

- Dropping an MP3 starts playback in under 1 s
- Dropping a `.txt` shows an error toast and does not break the app
- The picker works with keyboard only
