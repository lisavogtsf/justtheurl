# V12 Plan: Plus page visual differentiation

## Problem

The `/justtheurlplus` page is functionally different from the front page but looks nearly identical. Users landing there from the warning link may not immediately register they're in a different mode. The page should feel obviously distinct while remaining clearly part of the same design family.

## Options considered

### Option A — Heavier strokes ("more deliberate")
Same neutral dark background; every border goes from `1.5px` to `3px`. Output box is always solid accent-coloured (not dashed when empty). The `+` in the h1 and the active mode-nav item use `var(--accent)`. Copy button font-weight bumped to 800.

*Impression: same instrument, heavier gauge strings.*

### Option B — Purple-tinted background ("different atmosphere")
Override `--bg`, `--surface`, `--border` via `.plus-page` CSS variable overrides. Everything that references those variables picks up the purple tint automatically.

Dark values:
- `--bg: #0e0c1a` (neutral `#0d0d0d` → cool purple-dark)
- `--surface: #16132b` (neutral `#1a1a1a` → deep indigo-surface)
- `--border: #3a3356` (neutral `#2e2e2e` → purple-tinted border)

*Impression: stepping through a door into a different room — same furniture, different walls.*

### Option C — Accent as structure ("lit up")
Neutral dark base; accent colour becomes structural rather than decorative. Input border is always accent (not just on focus). Output has a faint `rgba(99,102,241,0.07)` accent wash. Copy/Open buttons are swapped — Open becomes filled accent, Copy becomes outline.

*Impression: same dark room, someone turned on a purple light.*

### Option A+B combined
Both changes together: deep purple-dark background AND 3px borders AND accent-coloured `+` and active nav item. Most visually distinct from the front page while preserving the same typeface, layout, and spacing.

---

## Decision: A+B combined, with light-mode parity

Go with **Option A+B**. Both the dark and light themes must be supported — the plus page should have a purple-tinted version of whichever theme the user has active.

### Dark-mode overrides (`.plus-page`)
```css
.plus-page {
  --bg: #0e0c1a;
  --surface: #16132b;
  --border: #3a3356;
}
```

### Light-mode overrides (`.plus-page` within `[data-theme="light"]`)
Mirror the tint shift in the light palette:
```css
[data-theme="light"] .plus-page {
  --bg: #f0eeff;
  --surface: #faf9ff;
  --border: #c4b8f0;
}
```

### Shared plus-page rules (both themes)
```css
/* 3px borders on inputs, output, small buttons */
.plus-page .url-input,
.plus-page .url-output {
  border-width: 3px;
}
.plus-page .input-row button {
  border-width: 3px;
}

/* Output always solid accent — never dashed */
.plus-page .url-output {
  border-style: solid;
  border-color: var(--accent);
}

/* + in title and active nav item use accent */
.plus-page .title__word--plus {
  color: var(--accent);
}
.plus-page .mode-nav__active {
  color: var(--accent);
}

/* Copy button heavier weight */
.plus-page .copy-btn {
  font-weight: 800;
}
```

---

## Implementation

All changes are CSS-only in `css/styles.css`. No HTML or JS changes required. No new tests needed — the visual treatment is untestable in jsdom and the structural HTML is unchanged.

**One commit:** CSS overrides for `.plus-page` (dark + light theme variable overrides + shared border/accent rules).

### Files to modify
| File | Change |
|------|--------|
| `css/styles.css` | Add `.plus-page` variable overrides and shared border/accent rules |

### Verification
- `npm test` passes (no behavior change)
- Manual dark mode: plus page shows purple-dark bg, 3px borders, accent `+`
- Manual light mode: plus page shows lavender-tinted bg, 3px borders, accent `+`
- Toggle theme on the plus page — both modes look right
- Front page is unaffected in both modes
