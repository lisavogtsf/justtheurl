# V11 Plan: Plus page copy + warning styling

## Change 1: Yellow warning styling on the front page

### Context

The warning status line ("⚠ Stripping may break this URL — try the smarter version →") currently renders in the same muted grey as all other status text. The ⚠ symbol and the warning phrase before the link need yellow colouring to signal urgency without being alarming.

### Approach

**New CSS custom property** — add `--warning` to both theme blocks in `styles.css`:
- Dark mode: `#eab308` (Tailwind `yellow-500` — visible on dark backgrounds)
- Light mode: `#a16207` (Tailwind `yellow-700` — darkened for WCAG AA contrast on white)

**New `data-state="warn"` on `.url-status`** — `updateStatus()` in `app.js` currently always writes `statusEl.dataset.state = state` (i.e. `"stripped"`), even when warn is true. Change this so when `warn === true`, it writes `"warn"` instead. This follows the existing pattern used for `"invalid"` → red.

**New CSS rule**:
```css
.url-status[data-state='warn'] {
  color: var(--warning);
  font-size: 0.875rem;
  font-weight: 500;
}
```
Match the weight/size of the `[data-state='invalid']` rule for visual consistency.

**Keep the link accent-coloured** — `.warn-link` inside the warn state should retain the standard accent colour so it reads as a clickable action, not just more warning text:
```css
.url-status[data-state='warn'] .warn-link {
  color: var(--accent);
}
```

### Files to modify

| File | Change |
|------|--------|
| `css/styles.css` | Add `--warning` to both theme blocks; add `[data-state='warn']` and `.warn-link` rules |
| `js/app.js` | Set `statusEl.dataset.state = "warn"` when `warn === true` |
| `tests/index.test.js` | Update existing warn tests; add test that `.url-status` has `data-state="warn"` when warning is shown |

### Commit sequence

1. Add `--warning` CSS variable and `[data-state='warn']` rule (CSS only, no behaviour change)
2. Set `data-state="warn"` in `app.js` + update/add tests

---

## Change 2: Persistent mode nav

### Context

Users who already know they want the smarter stripping experience should be able to get there without waiting for a warning. A subtle two-item tab strip below the h1 communicates that two modes exist without distracting from the core UI.

### Approach

Both pages get a `<nav class="mode-nav" aria-label="Stripping mode">` inserted immediately after the `<h1>` in the `<header>`. The active page renders its label as a `<span>` with `aria-current="page"`; the inactive one is an `<a>`.

**`index.html`** (simple is active):
```html
<nav class="mode-nav" aria-label="Stripping mode">
  <span class="mode-nav__active" aria-current="page">simple</span>
  <span aria-hidden="true">|</span>
  <a href="/justtheurlplus" class="mode-nav__link">smarter +</a>
</nav>
```

**`justtheurlplus/index.html`** (smarter + is active):
```html
<nav class="mode-nav" aria-label="Stripping mode">
  <a href="/" class="mode-nav__link">simple</a>
  <span aria-hidden="true">|</span>
  <span class="mode-nav__active" aria-current="page">smarter +</span>
</nav>
```

**New CSS** (add to `styles.css`):
```css
.mode-nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 0.25rem;
}

.mode-nav__active {
  color: var(--text);
  font-weight: 500;
}

.mode-nav__link {
  color: var(--muted);
  text-decoration: none;
}

.mode-nav__link:hover {
  color: var(--text);
}
```

### Files to modify

| File | Change |
|------|--------|
| `index.html` | Add `<nav class="mode-nav">` after `<h1>` |
| `justtheurlplus/index.html` | Add `<nav class="mode-nav">` after `<h1>` (smarter + active) |
| `css/styles.css` | Add `.mode-nav` rules |
| `tests/index.test.js` | Nav structure tests |
| `tests/justtheurlplus.test.js` | Nav structure tests |

### Tests

**Front page:**
- Nav exists with `aria-label="Stripping mode"`
- Active `<span>` has text "simple" and `aria-current="page"`
- Link has text "smarter +" and `href="/justtheurlplus"`

**Plus page:**
- Nav exists
- Active `<span>` has text "smarter +" and `aria-current="page"`
- Link has text "simple" and `href="/"`

### Commit sequence

1. CSS for `.mode-nav` + nav in `index.html` + front-page tests
2. Nav in `justtheurlplus/index.html` + plus-page tests (CSS already present)
