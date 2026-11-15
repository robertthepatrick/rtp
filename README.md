# robertthepatrick.com

Source for Robert Patrick's portfolio site. Static HTML, no build step, no
framework — this repo deploys as-is to Netlify (or any static host).

## Structure

Each case study and page is a self-contained folder: `/<slug>/index.html`
plus its own `img/` (and occasionally `video/`). That gives clean URLs
(`robertthepatrick.com/honda`, not `/honda.html`), no shared-asset
collisions between pages, and a page can be added or removed without
touching anything else in the repo.

The home page lives at the repo root (`/index.html`).

```
/                     home page
/about/
/case-studies/
/book-a-meeting/
/<case-study-slug>/   one per case study (honda, ago, nikelab, verizon, ...)
/<photo-story-slug>/  one per photography story (china-trek, thailand, ...)
/reference/           not a live page — see below
```

## `/reference/`

A documented, de-duplicated version of the CSS/JS patterns shared across
pages (header-tone script, cursor variants, standard layout blocks) plus
`audit-report.md`, a site-wide consistency audit. This is working
documentation for whoever (human or Claude) touches the site next — it is
**not** currently wired into the live pages. Every page still ships its own
inline `<style>`/`<script>`, exactly as it worked as a Claude Artifact.
Pulling the shared code out into real includes is a separate, deliberate
refactor, not something to do quietly while migrating files.

## Known gaps

- `wired-store/` is missing two video files (`wiredstore-film.mp4`,
  `wiredstore-hero.mp4`) — they exceeded this migration's fetch size limit.
  Re-add them directly if you have the source files.
- `index.html` (home) and `case-studies/index.html` were pulled without
  their images due to a platform restriction on the source artifact at
  backup time. Check both pages before publishing; re-supply any missing
  images directly.

## Deploying

Point Netlify at this repo, root directory, no build command, publish
directory `/`. Clean URLs work out of the box since every page is
`<slug>/index.html`.
