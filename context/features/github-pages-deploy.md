# GitHub Pages Deploy

## Overview

Publish the static build to GitHub Pages at `https://whosedreamisthis.github.io/audio-visualizer/` through GitHub Actions.

## Goals

- [ ] Set `base: "/audio-visualizer/"` in `vite.config.ts` (make it overridable by env for local previews)
- [ ] Build all public asset URLs (presets, manifest, favicon) with `import.meta.env.BASE_URL`
- [ ] `.github/workflows/deploy.yml`: on push to `main`, run `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `actions/configure-pages`, `actions/upload-pages-artifact` (path `dist`) and `actions/deploy-pages`
- [ ] Workflow permissions: `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`
- [ ] In repo settings: Pages → Source: GitHub Actions (manual step; document it)
- [ ] Add a `404.html` fallback only if a router is introduced
- [ ] README: live demo link, dev/build/test commands, license and attribution for preset tracks
- [ ] Verify with `npm run build && npm run preview` using the real base path

## Requirements

- No secrets needed (static client app)
- Pin action versions
- Works over HTTPS so `getUserMedia` is available

## Acceptance Criteria

- Pushing to `main` deploys automatically
- The live site loads, plays a preset and shows no 404s in the network tab
