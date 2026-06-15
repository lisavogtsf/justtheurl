# V14 Plan: Update README to cover justtheurlplus

## Problem

The README describes only the simple mode (`/`). `justtheurlplus` (`/justtheurlplus`) has existed since V10 but is invisible in the docs: the intro, "What it does," Features, Project structure, and Deployment sections all omit it entirely.

## What needs updating

### 1. Intro / description
Add a one-sentence summary that the tool has two modes: a simple strip-everything mode and a smarter mode that removes only known tracking params while preserving functional ones.

### 2. "What it does"
The current section only shows strip-everything behaviour. Add coverage of the smarter mode:
- Targeted removal of known tracking params (`utm_*`, `fbclid`, `gclid`, etc.)
- Site-aware functional param preservation (YouTube `v`/`t`/`list`, Google `q`, Amazon `keywords`, etc.)
- Behaviour when no tracking params are present ("already clean")

### 3. Features
The feature list applies to both pages. Add:
- **Two modes** — simple (strip all params) vs. smarter+ (strip only tracking, keep functional)

### 4. Project structure
Current structure table omits the plus-specific files. Add:
```
justtheurlplus/index.html   # smarter+ page
js/app-plus.js              # DOM wiring for the plus page
js/url-utils-plus.js        # smart stripping logic (allowlist + denylist)
tests/                      # Vitest suite covering both pages
```

### 5. Deployment
Mention that `/justtheurlplus` is served as a sub-path of the same GitHub Pages site.

---

## Implementation approach

README changes are not testable in jsdom. The TDD requirement applies to any _behaviour_ changes; pure doc edits don't have a test counterpart. The one place TDD can be applied: if any wording changes in `index.html` or `justtheurlplus/index.html` (e.g. page title, footer), write/update a test first.

For this plan, all changes are README-only — no HTML, CSS, or JS changes. **No tests needed.** One commit per logical section updated would be over-engineered here; one commit covering the full README update is appropriate.

## Files to modify

| File | Change |
|------|--------|
| `README.md` | Update intro, What it does, Features, Project structure, Deployment |

## Commit

Single commit: `docs: update README to document justtheurlplus`
