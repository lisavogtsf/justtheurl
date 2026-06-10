# V7 Plan: Footer with links and privacy note

## Goal

Add a minimal footer below `<main>` with three pieces of information:
- A link to the "why remove tracking" resource
- A privacy reassurance
- Attribution and source code link

## Content

```
Why remove tracking from URLs?   ← links to https://activistchecklist.org/links/
Your URLs never leave your browser.
© 2026 Lisa Vogt (and Claude Code), source code
  ↑ Lisa Vogt links to https://github.com/lisavogtsf/
  ↑ source code links to https://github.com/lisavogtsf/justtheurl
```

## Steps

### Step 1 — Red

Add to `tests/index.test.js` (end of file, new `describe('footer')` block):

- Footer element exists (`<footer>`)
- Footer contains a link to `https://activistchecklist.org/links/`
- Footer contains a link to `https://github.com/lisavogtsf/`
- Footer contains a link to `https://github.com/lisavogtsf/justtheurl`
- Footer contains the privacy text "Your URLs never leave your browser."

Run `npm test` and confirm all five new tests fail. Do not commit yet.

### Step 2 — Green

Add `<footer>` element to `index.html` below `</main>`:

```html
<footer class="site-footer">
  <p><a href="https://activistchecklist.org/links/">Why remove tracking from URLs?</a></p>
  <p>Your URLs never leave your browser.</p>
  <p>© 2026 <a href="https://github.com/lisavogtsf/">Lisa Vogt</a> (and Claude Code), <a href="https://github.com/lisavogtsf/justtheurl">source code</a></p>
</footer>
```

Run `npm test` and confirm all tests pass with no stderr. Commit tests + HTML together.

### Step 3 — Refactor (CSS)

Add `.site-footer` styles to `css/styles.css`:
- `font-size: 0.75rem`
- `color: var(--muted)`
- `text-align: center`
- `display: flex; flex-direction: column; gap: 0.25rem`
- Links: `color: var(--muted)` with underline, hover brightens to `var(--text)`

Run `npm test` and confirm tests still pass. Commit CSS separately.

## Out of scope

- No JS changes
- No changes to existing tests
