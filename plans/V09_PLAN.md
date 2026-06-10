# V09 Plan: Polish and UX improvements

## Goal

Address several UX gaps and semantic issues identified in a fresh code review:

1. Respect `prefers-color-scheme` on first load
2. Guard auto-copy so it doesn't fire on every keystroke while typing
3. Handle paste permission errors gracefully
4. Add a favicon
5. Add `for` attribute to `<output>`
6. Move `<h1>` inside a `<header>` landmark

---

## Step 1 — `prefers-color-scheme` on first load

**Problem:** Dark mode is always the default. Users whose OS is set to light mode get dark mode on first visit, contradicting their system preference.

**Red:** Add test — when `prefers-color-scheme` media query matches `light`, `initApp` sets `data-theme="light"` on the html element.

**Green:** In `initApp`, before wiring up the theme toggle, check `doc.defaultView.matchMedia('(prefers-color-scheme: light)').matches` and set `data-theme="light"` (plus show moon/hide sun icons) if true.

**Commit:** test + implementation together.

---

## Step 2 — Guard auto-copy on input

**Problem:** `clipboard.writeText` is called on every `input` event, including while the user is mid-typing. This floods the clipboard with partial URLs.

**Red:** Add test — auto-copy fires only when the stripped result changes (i.e. when state transitions to `stripped` or `clean`, and the result differs from the previous result).

**Green:** In the `input` event handler in `app.js`, track the last-copied value and skip the `copyToClipboard` call if the result is the same as the last copy.

**Commit:** test + implementation together.

---

## Step 3 — Paste button error handling

**Problem:** If the user denies clipboard read permission, the `paste` click handler throws an unhandled promise rejection. The error is swallowed silently (or worse, surfaces as a console error).

**Red:** Add test — when `clipboard.readText` rejects, the `.url-status` element shows a message like "clipboard access denied".

**Green:** Wrap the `readText` call in a `try/catch` (or `.catch()`) and call `updateStatus` with a new `'error'` state and an appropriate message.

**Commit:** test + implementation together.

---

## Step 4 — Favicon

**Problem:** No `<link rel="icon">` in `<head>`, so the browser tab shows a blank icon.

**Red:** Add test — the document `<head>` contains a `<link rel="icon">` element.

**Green:** Add a `<link rel="icon" href="favicon.svg" type="image/svg+xml">` to `index.html` and create a minimal `favicon.svg` (e.g. a small text or shape mark matching the accent color).

**Commit:** test + HTML/SVG file together.

---

## Step 5 — `<output for="url-input">`

**Problem:** The `<output>` element supports a `for` attribute to declare its computed relationship to named inputs. It's missing here.

**Red:** Add test — `output.htmlFor` (or `getAttribute('for')`) equals `'url-input'`.

**Green:** Add `for="url-input"` to the `<output>` element in `index.html`.

**Commit:** test + HTML together.

---

## Step 6 — Wrap `<h1>` and theme toggle in `<header>`

**Problem:** The `<h1>` and `#theme-toggle` are direct children of `<body>`, outside any landmark. Wrapping them in `<header>` gives the page cleaner landmark structure.

**Red:** Add test — `doc.querySelector('header h1')` is not null.

**Green:** Wrap the `<h1>` and `<button id="theme-toggle">` in a `<header>` element in `index.html`. Update any CSS selectors that target `body > h1` or `body > button#theme-toggle`.

**Commit:** test + HTML + CSS together.

---

## Out of scope

- Theme persistence in `localStorage` (intentionally excluded)
- Selective param stripping (future feature)
- Any new stripping logic
