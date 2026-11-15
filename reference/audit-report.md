# robertthepatrick.com — CSS/JS/image consolidation audit

Scope: all 26 live pages (20 original + the 6 Photography pages added mid-audit). No live artifact was edited, republished, or had its comments touched. This is a read-only audit plus two reference files (`css/site.css`, `js/site.js`) built from the common code already in use.

## Headline numbers

- **A ~207-line CSS core and a ~4-part JS core are pasted into every case-study-style page.** Confirmed by direct diff: `book-meeting`'s and `google-enterprise`'s embedded CSS are identical for lines 1–206 (tokens, layout primitives, header/nav, buttons, hero, bands, type, footer, cursor CSS, the "AGO-standard," "Global nav refinements," and "No grey placeholders" blocks). Their embedded JS (nav/scroll/tone + cursor + clip-reveal, 8,701 bytes) is **byte-for-byte identical** (sha256 `d573095136c6…` on both).
- That core (~14.8KB of CSS alone) is duplicated across roughly 21 of the 26 pages that use the case-study template (everything except Home, About, Case Studies index, and the Photography index/sub-pages, which have their own related-but-not-identical shape).
- A **second, later shared block — the click-to-lightbox viewer (CSS + JS)** — is pasted byte-for-byte into all 5 photography sub-pages (China trek, Thailand, A butcher, Portraits, Scandinavia). It was never folded back into the original core.
- **Two shared image assets are duplicated verbatim across every page checked.** Of the 13 pages where `list_files` succeeded (see below), `texture-white.png` (153,280 bytes) and `wordmark.png` (4,725 bytes) are byte-identical (same sha256) on all 13, plus one more `wordmark.png`-identical copy under a different filename (`lpn-wordmark-site.png` on the LPN page). That alone is **≈1.86MB of duplicated image bytes** just among the checked pages — the true total across all 26 is almost certainly higher.
- Image duplication could only be directly confirmed (via `list_files` + sha256) on 13 of 26 pages: Scough, LPN, NikeLab, WIRED Store, Cloud Innovators, Verizon, Article Group $25M, Photography index, China trek, Thailand, Butcher, Portraits, and Scandinavia. The other 13 — Home, About, Case Studies index, Book a meeting, Amazon, JackThreads, AGO, GoUnicode, TGR, Honda, Adobe, and GE — are flagged below as "not checked (has comments)," since `list_files` is blocked on any artifact Robert has commented on. This is expected behavior, not an error, but it means the true image-duplication total across all 26 pages is almost certainly higher than the ≈1.86MB confirmed above.

## Canonical reference files

Two files were assembled from the confirmed common core and are included alongside this report:

- **`css/site.css`** — the ~207-line shared core (tokens, layout, header/nav, buttons, hero/band/sec primitives, type scale, footer, cursor CSS, AGO-standard/Global-nav/no-grey-placeholder blocks) **plus** three things that should be promoted into the shared layer because they are either universal or fix a universal latent bug:
  1. The "Reader comment" hero-margin/transparent-header pair, found pasted identically on ~20 of 26 pages.
  2. A one-line mobile-nav-dropdown text-color fix, found on only the Photography index page, which fixes a latent invisible-text bug that exists on every other page using the same mobile-dropdown + header-tone combination.
  3. The full click-to-lightbox block, found pasted identically on all 5 photography sub-pages.
- **`js/site.js`** — the nav-toggle/scroll-hide-header/header-tone script, the **pixel-sampling** cursor variant (the more complete of two variants found in the wild — see Drift #1 below), the clip-path reveal `IntersectionObserver`, and the lightbox script (written so it no-ops on pages with no gallery grid).

These are reference files only — no page has been switched over to them.

## Drift found (real inconsistencies, not just duplication)

1. **Two cursor-script variants are live simultaneously.** "Simple" (section-background-color sampling only) vs "pixel-sampling" (adds `imgData`/`posFrac`/`imgPixel` to sample the actual image pixel under the cursor, falling back to simple). Simple-variant pages confirmed: Honda, LPN, Verizon, Article Group $25M. Pixel-sampling pages confirmed: Scough, NikeLab, WIRED Store, Cloud Innovators, Photography index, China trek, Thailand, Butcher, Portraits, Scandinavia, plus the earlier TGR/Adobe/GE family. `site.js` standardizes on pixel-sampling.
2. **The header-tone function's dark-section color has at least two, possibly three, live versions.** Most pages return a "blue-grey" color (`rgb(76,95,127)` / `#4c5f7f`) for a near-black background under the header. The **Labor Protection Network** page's copy of the same function returns a "cream" color (`rgb(239,235,225)` / `#efebe1`) instead — a real functional difference, not a stray byte: on LPN a black section tones the header cream-on-black instead of blue-grey-on-white. The Scandinavia page adds one more early-return branch (exact-match on its yellow `#ffbd38`) ahead of the shared logic — a refinement, not a conflict. `site.js` standardizes on the blue-grey version used by the majority; LPN should be reviewed to see if its cream version was an intentional one-off or just drift.
3. **Honda's case-study CSS/JS is visibly behind the rest of the site.** It is missing the AGO-standard additions, Global nav refinements, and No-grey-placeholders blocks; it uses `--header-h:91px→` wait, confirmed values: `--header-h:107px` (vs 91px everywhere else), a 72px mobile header height (vs 61px), a 200px logo width (vs 170px), and a 950px split-stack breakpoint (vs 600px). It's also missing the header-tone-color logic entirely and uses the simple cursor variant. This page is running an older template snapshot than every other page audited.
4. **Broken/outdated CTA links on two pages.** Honda and Article Group $25M ("AG") point their footer "Schedule a chat" and "All the work" buttons at live `https://robertthepatrick.com/booking` and `/thework` URLs instead of the `claude.ai/artifact/...` URLs every other page uses. These are very likely dead or wrong links in the current artifact-hosted context.
5. **A stale "Honda case study" comment header persists at the top of the shared CSS block on nearly every page**, including pages that have nothing to do with Honda — harmless, but confusing provenance for anyone reading the source later.
6. **The `texture-white` background asset exists under three different filenames/extensions** (`.png`, `.jpg`, `.webp`) depending on the page, even though the pixels are otherwise meant to be the same texture — worth standardizing on one file and one name.
7. A few one-off CSS structural variants that are harmless (e.g., Verizon's `.split` grid uses `minmax(0,40fr) minmax(0,60fr)` instead of the template's `minmax(0,2fr) minmax(0,3fr)` — same ratio, different notation).

## Per-page table

| Page | CSS drift | JS drift | Shared images confirmed duplicated |
|---|---|---|---|
| Home | not checked (has comments) | most-evolved, merged nav/scroll/cursor script (basis for canonical JS's structure) | not checked |
| About | not checked (has comments) | — | not checked |
| Case Studies (index) | not checked (has comments) | — | not checked |
| Book a meeting | **none** — one of the two cleanest template copies | **none** — byte-identical to Google for Enterprise's JS | not checked |
| Google for the Enterprise | minor — missing `.nav-a.current` underline rule (1 line) | **none** — byte-identical to Book a meeting's JS | not checked |
| Amazon Wearable AI | not checked (has comments) | not checked | not checked |
| JackThreads | none beyond general core confirmation (not itemized) | none beyond general core confirmation | not checked |
| ArticleGroup.org (AGO) | none beyond general core confirmation | none beyond general core confirmation | not checked |
| GoUnicode | none beyond general core confirmation | none beyond general core confirmation | not checked |
| Tiger Woods / TGR | notable — see Drift #6 pattern (Reader-comment hero override independently pasted) | pixel-sampling cursor | not checked |
| Honda | **notable — top priority.** Outdated template version: missing AGO-standard/Global-nav/no-grey blocks; `--header-h:107px` vs 91px; mobile header 72px vs 61px; logo 200px vs 170px; 950px breakpoint vs 600px | missing header-tone-color logic entirely; simple cursor variant | not checked |
| Adobe #withMalala | notable — Reader-comment override pattern | pixel-sampling cursor | not checked |
| GE (General Electric) | minor | pixel-sampling cursor | not checked |
| Scough | none | pixel-sampling cursor, blue-grey tone | not checked |
| Labor Protection Network | none in core; **cream tone-function variant** (Drift #2); simple cursor | simple cursor variant; cream tone-function variant | texture-white.png, wordmark.png (as `lpn-wordmark-site.png`) — both confirmed duplicated |
| NikeLab | none | pixel-sampling cursor, blue-grey tone | texture-white.png, wordmark.png confirmed duplicated |
| WIRED Store | none in shared parts (large page-specific night-theme block is intentional) | pixel-sampling cursor, blue-grey tone | texture-white.png, wordmark.png confirmed duplicated |
| Google Cloud Innovators | none | pixel-sampling cursor, blue-grey tone | texture-white.png, wordmark.png confirmed duplicated |
| Verizon | minor — `.split` grid-ratio written as 40fr/60fr instead of 2fr/3fr (cosmetic only) | simple cursor variant | texture-white.png, wordmark.png confirmed duplicated |
| Article Group $25M ("AG") | none in shared core | simple cursor variant | texture-white.png, wordmark.png confirmed duplicated |
| Photography (index) | **notable positive** — carries a real latent-bug fix (mobile nav-dropdown text color) that's missing everywhere else | pixel-sampling cursor, blue-grey tone | texture-white.png, wordmark.png confirmed duplicated |
| China trek | none in shared core; carries the lightbox block | pixel-sampling cursor; lightbox script | texture-white.png, wordmark.png confirmed duplicated |
| A bloody night in Thailand | none; lightbox block | pixel-sampling cursor; lightbox script | wordmark.png confirmed duplicated (no texture-white.png on this page) |
| A butcher | none; lightbox block | pixel-sampling cursor; lightbox script | texture-white.png, wordmark.png confirmed duplicated |
| Portraits | none; lightbox block | pixel-sampling cursor; lightbox script | texture-white.png, wordmark.png confirmed duplicated |
| A summer in Scandinavia | none; lightbox block; extra yellow-exact-match tone branch (harmless refinement); page title has a typo ("Sandinavia") | pixel-sampling cursor; lightbox script | texture-white.png, wordmark.png confirmed duplicated |

## Punch list, prioritized

1. **Fix Honda.** It's running a visibly older template snapshot (missing three whole CSS blocks that every other page has, wrong header heights/breakpoints, no tone-color script) and its footer/CTA links point at dead-looking `robertthepatrick.com` URLs instead of artifact URLs. This is the single page most worth a manual refresh.
2. **Fix Article Group $25M's footer/CTA links** — same dead-link pattern as Honda.
3. **Decide whether LPN's "cream" header-tone variant was intentional**, and if not, bring it in line with the rest of the site.
4. **Promote the mobile-nav-dropdown text-color fix (currently only on the Photography index page) to every other page** — it's a real latent bug on every page that combines the mobile menu with the tone script, which is nearly all of them.
5. **Standardize the cursor script on the pixel-sampling variant everywhere** (Honda, LPN, Verizon, AG currently have the plainer "simple" variant).
6. Lower priority / cosmetic: consolidate `texture-white` to one filename/format, and clean up the stale "Honda case study" comment header that's copied at the top of nearly every page's CSS even when the page has nothing to do with Honda.

No live page was touched to produce this report. `css/site.css` and `js/site.js` are ready to use as the single source of truth whenever Robert wants to start pointing pages at them instead of their own embedded copies.
