# V6 Plan: Readability and Structural Cleanup

## Overview

The codebase is in good shape — TDD discipline shows, the pure function / DOM-wiring split is clean, and test coverage is solid. But three areas accumulate friction: `index.test.js` repeats clipboard boilerplate in nearly every test, the `initApp` describe block has grown too large to scan, and `app.js` has DOM queries scattered at different indentation levels rather than grouped. CSS has one duplication worth tidying.

None of these changes touch product behavior. All tests should stay green throughout.

---

## 1. Test helpers in `index.test.js`

**Problem:** The `initApp` describe block has ~50 tests. Most of them share the same three-line setup:
```js
const doc = loadPage();
doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
initApp(doc);
```
And many then fire input events with the same pattern:
```js
input.value = 'https://example.com/page?foo=bar';
input.dispatchEvent(new doc.defaultView.Event('input'));
```

This repetition makes tests hard to read — you have to skip past boilerplate to find the assertion.

**Fix: three small helpers at the top of the file**

```js
function makeClipboard() {
  return { writeText: vi.fn().mockResolvedValue(undefined) };
}

function setupDoc() {
  const doc = loadPage();
  doc.defaultView.navigator.clipboard = makeClipboard();
  initApp(doc);
  return doc;
}

function typeUrl(doc, url) {
  const input = doc.querySelector('input[type="url"]');
  input.value = url;
  input.dispatchEvent(new doc.defaultView.Event('input'));
  return input;
}
```

With these helpers, the typical test collapses from 6–8 lines to 3–4 lines:
```js
it('after stripping 1 param, .url-status text is "1 param removed"', () => {
  const doc = setupDoc();
  typeUrl(doc, 'https://example.com/page?foo=bar');
  expect(doc.querySelector('.url-status').textContent).toBe('1 param removed');
});
```

**Also:** Two tests set up `navigator.clipboard` with both `readText` and `writeText` (paste tests) — those can't use `makeClipboard()` as-is, but can be written inline clearly.

---

## 2. Nested `describe` blocks inside `initApp`

**Problem:** The `initApp` describe block (lines 188–544) contains 48 tests covering at least six distinct behaviors: theme toggle, paste button, copy button, clear/escape, output state, and status messages. Navigating it to find a specific test requires scrolling through everything.

**Fix:** Nest related tests under descriptive `describe` blocks inside the outer `initApp` describe:

```
describe('initApp', () => {
  describe('input and output', () => { ... })   // input → output value, data-state
  describe('status messages', () => { ... })    // .url-status text for all states
  describe('copy button', () => { ... })        // click copies, label changes
  describe('paste button', () => { ... })       // hidden when unavailable, click pastes
  describe('clear and escape', () => { ... })   // clears, focus returns, status resets
  describe('open button', () => { ... })        // opens in new tab
  describe('theme toggle', () => { ... })       // light/dark switching, icon visibility
})
```

This doesn't change what's tested — only where tests live within the file.

---

## 3. Fix duplicate test description

**Problem:** Line 355 and line 377 both have the description `'after clicking clear on a clean URL, .url-status is empty'`, but they test different things. The one at line 377 actually checks that focus returns to the input after clicking clear.

**Fix:** Rename line 377's test to `'after clicking clear, focus returns to the input'`.

---

## 4. Group `paramCount` tests in `url-utils.test.js`

**Problem:** The `paramCount` tests (lines 91–119) sit at the end of the `describe('stripQueryParams')` block with no visual separation from the `result`/`state` tests above them.

**Fix:** Wrap them in a nested `describe('paramCount', ...)` block:
```js
describe('paramCount', () => {
  it('returns 1 when one query param is stripped', ...)
  it('returns 2 when two query params are stripped', ...)
  ...
})
```

---

## 5. Group DOM queries at the top of `initApp`

**Problem:** In `app.js`, `input`, `output`, `statusEl`, and `copyBtn` are queried at the top of `initApp`, but `pasteBtn` (line 48), `openBtn` (line 58), `clearBtn` (line 74), and `themeToggle` (line 77) are queried inline, mixed in with event listener setup. You can't see the full set of elements the function works with without reading the whole thing.

**Fix:** Move all `querySelector` calls to a single block at the top of `initApp`, before any event listeners:

```js
export function initApp(doc) {
  const input = doc.querySelector('input[type="url"]');
  const output = doc.querySelector('output');
  const statusEl = doc.querySelector('.url-status');
  const copyBtn = doc.querySelector('button#copy');
  const copyLabel = copyBtn.querySelector('.copy-label');
  const pasteBtn = doc.querySelector('button#paste');
  const openBtn = doc.querySelector('button#open');
  const clearBtn = doc.querySelector('button#clear');
  const themeToggle = doc.querySelector('button#theme-toggle');
  const sunIcon = themeToggle.querySelector('.icon-sun');
  const moonIcon = themeToggle.querySelector('.icon-moon');

  // ... all event listeners follow
}
```

---

## 6. CSS: extract shared action button styles

**Problem:** `.copy-btn` and `.open-btn` share ~12 property declarations (width, padding, font-size, font-family, font-weight, border-radius, cursor, display, align-items, justify-content, gap, and parts of transition). Only background, color, and border differ.

**Fix:** Use a comma-separated selector for shared properties, then override per-button:

```css
.copy-btn,
.open-btn {
  /* shared layout and typography */
  width: 100%;
  padding: 0.9rem 2.5rem;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}

.copy-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  &:hover { background: var(--accent-hover); }
  &:active { transform: scale(0.97); }
}

.open-btn {
  background: transparent;
  color: var(--accent);
  border: 2px solid var(--accent);
  &:hover { background: var(--accent); color: #fff; }
  &:active { transform: scale(0.97); }
}
```

---

## Implementation order

These are independent cleanups — do them in any order. Each is a single focused commit.

| Step | File | Change |
|---|---|---|
| 1 | `tests/index.test.js` | Add `makeClipboard`, `setupDoc`, `typeUrl` helpers; apply throughout |
| 2 | `tests/index.test.js` | Add nested `describe` blocks inside `initApp` |
| 3 | `tests/index.test.js` | Fix duplicate test description on line 377 |
| 4 | `tests/url-utils.test.js` | Wrap `paramCount` tests in nested `describe` |
| 5 | `js/app.js` | Move all DOM queries to top of `initApp` |
| 6 | `css/styles.css` | Extract shared `.copy-btn, .open-btn` base styles |

Steps 1–3 can be done together (all in the same file). Steps 4, 5, 6 are each independent.

---

## What is already good and should stay

- The separation of `url-utils.js` (pure function, no DOM) from `app.js` (DOM wiring) — keep this boundary sharp.
- The `stripQueryParams` function and its comments — the non-obvious behavior around spaces, dot checks, and key-value hashes is well-documented.
- The structural tests (`page title`, `url input`, `result display`, etc.) are correctly in separate top-level `describe` blocks, not inside `initApp`.
- CSS custom properties for theming — well-organized, clean light/dark definitions.
