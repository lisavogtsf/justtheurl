# V16 Plan: Rename nav labels to classic/plus, update warning link copy

## Context

The mode nav and warning link currently use a "simple" vs. "smarter +" framing
(introduced in V11). "Smarter" is a comparative that only makes sense next to
"simple", implies the other mode is unintelligent, and duplicates the signal
already carried by the `+` in the `justtheurl+` brand.

Decision: rename the nav labels to **classic** / **plus**, both neutral terms
that describe "the original mode" vs. "the enhanced mode" without a quality
judgement. Update the warning link copy to match — since "smarter" no longer
exists as a term, the link should point at the named destination
(`justtheurl+`) instead.

## Changes

### 1. Front-page nav (`index.html`)

- `.mode-nav__active` text: `simple` → `classic`
- `.mode-nav__link` text: `smarter +` → `plus` (href unchanged: `plus/`)

### 2. Plus-page nav (`plus/index.html`)

- `.mode-nav__link` text: `simple` → `classic` (href unchanged: `../`)
- `.mode-nav__active` text: `smarter +` → `plus`

### 3. Warning link copy (`js/app.js`)

- `try the smarter version →` → `try justtheurl+ →`

### 4. README terminology

- "Simple mode" → "Classic mode", "Smarter+ mode" → "Plus mode" headings
- Update inline prose references from "simple"/"smarter+" to "classic"/"plus"
- The `justtheurl+` brand name itself is unchanged

## Tests to update

- `tests/index.test.js` — mode nav `describe` block: expect `classic` /
  `plus` instead of `simple` / `smarter +`
- `tests/index.test.js` — warning link: add assertion that link text is
  `try justtheurl+ →`
- `tests/plus.test.js` — mode nav `describe` block: expect `classic` / `plus`
  instead of `simple` / `smarter +`

## Commit sequence

1. `plans/V16_PLAN.md` (this document)
2. Front-page nav rename (`index.html` + `tests/index.test.js`)
3. Plus-page nav rename (`plus/index.html` + `tests/plus.test.js`)
4. Warning link copy change (`js/app.js` + `tests/index.test.js`)
5. README terminology update (docs only, no test counterpart)
