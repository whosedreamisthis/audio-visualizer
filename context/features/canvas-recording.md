# Canvas Recording (Stretch)

## Overview

Record the visualizer and the audio into a downloadable video.

## Goals

- [ ] "Record" button with a visible recording indicator and elapsed time
- [ ] Capture video via `canvas.captureStream(60)` and audio via a `MediaStreamAudioDestinationNode` tapped after the gain node; combine into one `MediaStream`
- [ ] `MediaRecorder` with the best supported MIME type (`video/webm;codecs=vp9,opus` falling back to vp8/mp4); feature-detect and hide the button if unsupported
- [ ] Stop → assemble the chunks into a `Blob` → trigger a download (`audio-visualizer-<date>.webm`)
- [ ] Auto-stop when the track ends (option)
- [ ] Recording does not change playback or the on-screen visuals
- [ ] Error handling with toasts; clean up streams and object URLs

## Requirements

- Recorder lifecycle in a hook (`useRecorder`) separate from UI
- Warn that tab visibility changes can pause canvas capture

## Acceptance Criteria

- A recorded clip plays back with synced audio and video in a normal player
- Recording a 30 s clip does not drop the live framerate noticeably
