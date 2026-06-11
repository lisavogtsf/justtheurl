# V13 Plan: Paste icon redesign

> **Note:** This document is a retroactive summary. All changes described here were designed and implemented interactively during a single session — no upfront plan existed.

## Problem

The previous paste icon was confusing at the 16px render size. It showed a clipboard body with an open gap at the top-right, and an arrow pointing to the **right** (outward), which read as "copy out" rather than "paste in". At small sizes the shapes were illegible.

## What we tried first

Three alternative icons were previewed (down-arrow-inside clipboard, content-lines clipboard, left-arrow-entering clipboard). None felt right.

## Final design

A two-layer icon:

- **Background:** blank clipboard — rectangle body with a small rounded-rectangle clip/tab at the top center
- **Foreground:** sheet of paper offset ~25% down and to the right, with three horizontal lines suggesting handwriting/content

Key construction details:
- Draw order matters: clipboard body → clip tab → paper sheet (each layer paints over the one before, so no strokes bleed through)
- The clip tab and paper sheet both get `style="fill: var(--surface)"` so they are opaque and adapt automatically to light/dark theme
- `stroke-width="1"` (half the library default of 2) so the fine two-layer structure reads cleanly at small sizes

## Files changed

| File | Change |
|------|--------|
| `icons/icons.svg` | Replaced `#icon-paste` symbol with new clipboard + paper design |
| `css/styles.css` | Added `#paste svg, #clear svg { width: 21px; height: 21px; }` — shared rule covering both pages |
| `index.html` | No icon-size change needed (handled by CSS) |
| `justtheurlplus/index.html` | No icon-size change needed (handled by CSS) |
| `preview-paste-icons.html` | Scratch preview file used during design iteration (not shipped) |

## Icon size

The paste and clear icons are rendered at **21px** (1.3× the standard 16px). This is a shared CSS rule in `styles.css` targeting `#paste svg` and `#clear svg`, so both the simple and plus pages inherit it from one place. The `width`/`height` HTML attributes on the `<svg>` elements remain at 16 as a fallback; CSS takes precedence.

## Dark mode

Because the opaque fills use `var(--surface)` rather than a hardcoded colour, the icon works correctly in both themes without any additional CSS rules. CSS custom properties cascade through the SVG `<use>` shadow DOM boundary.
