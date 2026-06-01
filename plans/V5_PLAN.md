# V5 Plan: UX Improvements from V1 Analysis

## Context

A comparison of the v1-claude-generates-critiques branch (untested, single-file, Claude macOS app generation) against the current main revealed five features in v1 that are worth bringing forward. V1 was written without tests and without `new URL()` parsing, but Claude's initial generation included several UX details that were lost when main was built up from scratch with TDD.

This plan implements those five improvements in strict TDD order.

---

## Features to implement

### 1. `role="status"` and `aria-atomic="true"` on the output element

**What:** v1 adds both `aria-live="polite"` and `role="status"` and `aria-atomic="true"` to its result container. Main has only `aria-live="polite"`.

**Why:** `role="status"` is the semantic complement to `aria-live="polite"` — it tells screen readers the region is a status message, not just a live region. `aria-atomic="true"` tells screen readers to announce the full content of the element when it updates, not just the changed portion. Together they produce cleaner, more complete announcements.

**Scope:** `index.html` only — two attribute additions. No JS change required.

---

### 2. Escape key to clear

**What:** Pressing `Escape` while the input is focused clears the input and resets the output, identically to clicking the Clear button.

**Why:** Standard keyboard affordance. Users who typed or pasted a URL expect Escape to undo it. V1 had this; main doesn't.

**Scope:** `app.js` — one `keydown` listener on the input.

---

### 3. Focus returns to input after clear

**What:** After clicking the Clear button (or pressing Escape), focus is returned to the URL input.

**Why:** After clearing, the next action is always to paste or type a new URL. Without this, the user has to click back into the input. V1's `clearAll()` ended with `urlInput.focus()`.

**Scope:** `app.js` — one `input.focus()` call added to the clear handler. Will be implemented in the same commit as Escape-to-clear since both actions should restore focus.

---

### 4. Paste button hides when clipboard API is unavailable

**What:** On page load, if `navigator.clipboard.readText` is not available (insecure context, or browser without support), the Paste button is hidden.

**Why:** A Paste button that silently fails is worse than no Paste button. This is especially relevant on mobile — an HTTP deployment or a browser that blocks clipboard access would leave the button visible but broken. V1 checked this explicitly.

**Scope:** `app.js` — a guard on init that sets `pasteBtn.hidden = true` when the API is unavailable.

---

### 5. Param count feedback

**What:** When params are stripped, display how many were removed — e.g. "2 params removed" — in a small note below the output. For a clean URL, show nothing extra. For invalid input, show nothing.

**Why:** "Stripped" state currently gives no indication of how much was removed. Knowing that 4 tracking params were stripped is more satisfying and informative than a plain clean URL appearing. V1 showed this in a meta row.

**Scope:**
- `js/url-utils.js` — extend the return value to include `paramCount: number`
- `tests/url-utils.test.js` — new tests for `paramCount` in the return value
- `index.html` — add a `<p class="strip-meta">` element below the output
- `js/app.js` — populate the meta element from `paramCount`
- `tests/index.test.js` — tests for the meta element content
- `css/styles.css` — minimal styling for the meta line

---

## Implementation order (TDD)

Each step is one Red → Green → commit cycle for a single test. Steps within a feature follow the same pattern.

### Step 1 — `role` and `aria-atomic` (structural, HTML-only)

1. Write test: `output` has `role="status"` → **red**
2. Add `role="status"` to `<output>` in `index.html` → **green** → commit
3. Write test: `output` has `aria-atomic="true"` → **red**
4. Add `aria-atomic="true"` to `<output>` in `index.html` → **green** → commit

---

### Step 2 — Escape to clear + focus after clear

These two behaviors are implemented together in one handler, so each test is its own red/green/commit cycle but they land in the same code location.

5. Write test: Escape clears input value → **red**
6. Add `keydown` listener for Escape in `app.js` → **green** → commit
7. Write test: Escape clears output value → **red**
8. Confirm green (already cleared by same handler) → commit
9. Write test: after Escape, `doc.activeElement` is the input → **red**
10. Add `input.focus()` to Escape handler → **green** → commit
11. Write test: after clicking Clear button, `doc.activeElement` is the input → **red**
12. Add `input.focus()` to clear button handler → **green** → commit

---

### Step 3 — Paste button hides when clipboard API unavailable

13. Write test: when `navigator.clipboard` is `undefined`, paste button has `hidden` attribute after `initApp` → **red**
14. Add availability guard in `app.js` → **green** → commit

---

### Step 4 — Param count in `url-utils.js`

15. Write test: stripping one param returns `paramCount: 1` → **red**
16. Add `paramCount` to `stripQueryParams` return value → **green** → commit
17. Write test: stripping two params returns `paramCount: 2` → **red**
18. Confirm green (already handled) → commit
19. Write test: clean URL (no params) returns `paramCount: 0` → **red**
20. Confirm green → commit
21. Write test: tracking hash stripped, no query params → `paramCount: 0` → **red**
22. Confirm green → commit

---

### Step 5 — Param count UI

23. Write test: `<p class="strip-meta">` exists in the DOM → **red**
24. Add element to `index.html` → **green** → commit
25. Write test: after stripping 1 param, `.strip-meta` text is "1 param removed" → **red**
26. Update `app.js` to populate `.strip-meta` from `paramCount` → **green** → commit
27. Write test: after stripping 2 params, `.strip-meta` text is "2 params removed" (plural) → **red**
28. Confirm green (already handled by same logic) → commit
29. Write test: for clean URL, `.strip-meta` is empty or hidden → **red**
30. Update `app.js` to clear `.strip-meta` for non-stripped states → **green** → commit
31. Add CSS: small muted text, `font-size: 0.75rem`, `color: var(--muted)`, `text-align: center`

---

## Notes on param counting

`stripQueryParams` currently returns `{ result, state }`. The count of stripped params can be derived from the URL before stripping:

```javascript
// Count params before clearing parsed.search
const paramCount = parsed.search
  ? new URLSearchParams(parsed.search).size
  : 0;
```

`URLSearchParams.size` is the number of key-value pairs. This is spec-correct and handles repeated keys and empty values properly. The `paramCount` is only meaningful when `state === "stripped"` and query params were present — tracking hash strips don't add to the count.

Return type becomes `{ result, state, paramCount }`.

---

## Param count display rules

| State | `.strip-meta` content |
|---|---|
| `stripped` with params | "N param removed" / "N params removed" |
| `stripped` (tracking hash only, no query) | *(empty — hash strip has no count)* |
| `clean` | *(empty)* |
| `invalid` | *(empty)* |
| `empty` | *(empty)* |

---

## Files changed

| File | Changes |
|---|---|
| `index.html` | `role="status"` + `aria-atomic="true"` on `<output>`; add `<p class="strip-meta">` |
| `js/url-utils.js` | Add `paramCount` to return value |
| `js/app.js` | Escape handler; `input.focus()` in clear; paste guard on init; populate `.strip-meta` |
| `css/styles.css` | `.strip-meta` styles |
| `tests/url-utils.test.js` | New tests for `paramCount` |
| `tests/index.test.js` | New tests for Escape, focus, paste guard, meta content |
