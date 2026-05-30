# V4 Plan: URL Input Edge Case Handling

## Context

The current `stripQueryParams` implementation is `url.split("?")[0]` — a naive string split with no URL validation, no fragment handling, and no user feedback when nothing was stripped or the input is invalid. V4 hardens the parsing logic and gives users clear feedback for the four meaningful states a URL can be in.

---

## States

Every input produces one of four states:

| State | Trigger | Output behaviour |
|---|---|---|
| `empty` | Input is blank/whitespace | Output empty (existing placeholder CSS) |
| `stripped` | Params or tracking hash removed | Output shows clean URL (existing accent style) |
| `clean` | Valid URL but nothing to strip | Output shows URL with "Already clean" note |
| `invalid` | Cannot be parsed as a URL | Output shows error note; no clipboard write |

State is communicated by a `data-state` attribute on the `<output>` element, e.g. `<output data-state="clean">`. CSS `::after` pseudo-elements render the "Already clean" and "Invalid URL" messages — no extra DOM elements needed.

---

## Edge cases and expected behaviour

| Input | Current behaviour | V4 behaviour |
|---|---|---|
| `https://example.com/page?foo=bar` | Strips to `/page` ✓ | Same ✓ — state: `stripped` |
| `https://example.com/page` | Shows URL unchanged, auto-copies | Shows URL + "Already clean" — state: `clean` |
| `https://example.com/page#ref=newsletter` | Unchanged (hash kept) | Strips hash — state: `stripped` |
| `https://example.com/page#introduction` | Unchanged | Hash kept — state: `clean` |
| `https://example.com/page?foo=bar#ref=x` | Strips query, keeps hash | Strips both — state: `stripped` |
| `https://example.com/page?foo=bar#section` | Strips query, keeps hash | Strips query, keeps hash — state: `stripped` |
| `https://example.com/page?a=1?b=2` | `/page` ✓ (works by coincidence) | `/page` ✓ — via URL spec |
| `example.com?foo=bar` | `example.com` (naive split) | Prepends `https://`, strips — state: `stripped` |
| `hello world` | Shows + copies "hello world" ❌ | Error state, no copy — state: `invalid` |
| `   ` (whitespace) | Copies whitespace ❌ | Treated as empty — state: `empty` |

---

## Parsing logic (replaces `split("?")[0]`)

Use `new URL()` for robust, spec-correct parsing.

```
1. Trim whitespace.
2. Try new URL(trimmed).
3. If that throws, try new URL("https://" + trimmed).
   → handles protocol-less input like "example.com?foo=bar"
4. If both throw → state: invalid.
5. Check parsed.search (query) and parsed.hash for tracking pattern.
6. Strip parsed.search unconditionally.
7. Strip parsed.hash if it contains "=" (tracking heuristic — see below).
8. Return parsed.toString() + state.
```

### Tracking hash heuristic

Strip `#fragment` only when the fragment contains `=`. This covers known tracking patterns (`#ref=newsletter`, `#utm_source=twitter`, `#_=_`) while preserving legitimate anchors (`#section-2`, `#introduction`, `#top`).

---

## Changes by file

### `js/url-utils.js`

Replace the single-line function. Return type changes from `string` to `{ result: string, state: string }`.

```javascript
// A hash fragment is treated as a tracking param if it contains "=",
// indicating a key=value pair (e.g. #ref=newsletter, #utm_source=twitter, #_=_).
// Plain anchors like #section-2 or #top do not contain "=" and are left alone.
const HASH_CONTAINS_KEY_VALUE = /=/;

export function stripQueryParams(rawUrl) {
  // Remove surrounding whitespace so "  https://example.com " is treated as a valid URL.
  const trimmed = rawUrl.trim();
  if (!trimmed) return { result: "", state: "empty" };

  // Attempt to parse as a full URL. If that fails, try prepending "https://"
  // to handle protocol-less input like "example.com?foo=bar".
  // If both attempts fail, the input is not a recognisable URL.
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    try {
      parsed = new URL("https://" + trimmed);
    } catch {
      return { result: "", state: "invalid" };
    }
  }

  // Record what was present before stripping, so we can report the correct state.
  const hadQuery = parsed.search !== "";
  const hadTrackingHash = HASH_CONTAINS_KEY_VALUE.test(parsed.hash.slice(1));

  // Always remove the query string. Remove the hash only if it looks like tracking.
  parsed.search = "";
  if (hadTrackingHash) parsed.hash = "";

  const result = parsed.toString();
  // "stripped" means something was actually removed; "clean" means the URL
  // was valid but had nothing to strip.
  const state = hadQuery || hadTrackingHash ? "stripped" : "clean";
  return { result, state };
}
```

### `tests/url-utils.test.js`

Replace the single test with a full suite covering each case (return type is now `{ result, state }`):

- Standard strip: `?foo=bar` → `{ result: "…/page", state: "stripped" }`
- Multiple query params stripped ✓
- Tracking hash `#ref=newsletter` → stripped, state: `"stripped"`
- `#_=_` → stripped (contains `=`) ✓
- Anchor hash `#section-2` → kept, state: `"clean"`
- Query + tracking hash → both stripped, state: `"stripped"`
- Query + anchor hash → query stripped, hash kept, state: `"stripped"`
- Already clean URL → state: `"clean"`
- Protocol-less: `example.com?foo=bar` → state: `"stripped"`
- Not a URL → `{ result: "", state: "invalid" }`
- Whitespace → `{ result: "", state: "empty" }`
- Multiple `?` → stripped correctly ✓

### `js/app.js`

Update the `input` event handler to destructure `{ result, state }`:

- Set `output.value = result`
- Set `output.dataset.state = state` (remove attribute when `empty`)
- Only call `copyToClipboard` when state is `"stripped"` or `"clean"` (not `"invalid"`)
- Set `input.setAttribute("aria-invalid", "true")` for `invalid` state; remove it otherwise

### `tests/index.test.js`

New `initApp` behaviour tests:

- Input with no query params → `output.dataset.state` is `"clean"`
- Input with query params → `output.dataset.state` is `"stripped"`
- Invalid input (`"not a url"`) → `output.dataset.state` is `"invalid"`
- Invalid input → clipboard `writeText` is **not** called
- Tracking hash (`#ref=foo`) → stripped in output, state: `"stripped"`
- Anchor hash (`#section`) → hash kept in output, state: `"clean"`

### `css/styles.css`

Add `--error` variable and state-driven messages via `::after`:

```css
:root {
  /* add: */
  --error: #ef4444;
}

[data-theme="light"] {
  /* add: */
  --error: #dc2626;
}

.url-output[data-state="clean"]::after {
  content: "Already clean";
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--muted);
  margin-top: 0.25rem;
}

.url-output[data-state="invalid"]::after {
  content: "Not a valid URL";
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--error);
}
```

---

## Order of implementation (TDD)

1. Unit tests for `url-utils.js` edge cases → red
2. Refactor `url-utils.js` with `new URL()` → green
3. Commit: `v4 step 1: robust URL parsing with new URL(), tracking hash detection`
4. Integration tests for new states in `index.test.js` → red
5. Update `app.js` to handle `{ result, state }` → green
6. Add CSS for `clean` and `invalid` states
7. Commit: `v4 step 2: clean/invalid state feedback in UI`
