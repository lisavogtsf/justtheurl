# justtheurl

A minimal tool for stripping tracking parameters from URLs. Paste a URL, get back the clean base URL — no query strings, no noise.

![justtheurl stripping query params from a URL](assets/screenshot.png)

## LLM/AI Attribution

This README.md and the vast majority of this project were authored by Claude Code (via VSCode and the Claude app).

## What it does

Modern URLs are often cluttered with tracking parameters and tracking fragments:

```
https://example.com/article?utm_source=twitter&utm_medium=social&utm_campaign=launch
https://example.com/article#ref=newsletter
```

justtheurl strips the query string and any tracking hash fragment, and hands you back:

```
https://example.com/article
```

Plain anchor hashes (e.g. `#section-2`) are preserved — only hash fragments that look like key=value tracking params (containing `=`) are removed.

The stripped URL is automatically copied to your clipboard the moment you paste. On mobile the full flow is a single tap: **Paste → done**.

## Features

- **Auto-copy** — stripped URL is copied to clipboard immediately on input
- **Paste button** — reads from clipboard directly, no long-press required on mobile
- **Open button** — opens the stripped URL in a new tab to verify the destination
- **Clear button** — resets the input in one tap
- **Dark/light mode** — toggle in the top-right corner; dark is default
- **Accessible** — labelled input, `aria-live` output, keyboard-navigable
- **Smart feedback** — shows "Already clean" when there's nothing to strip; shows "Not a valid URL" for unrecognisable input and skips the clipboard write

## Deployment

The live app is at **[lisavogtsf.github.io/justtheurl](https://lisavogtsf.github.io/justtheurl)**.

It is deployed via GitHub Pages from the `gh-pages` branch root. There is no build step — GitHub Pages serves `index.html` directly. To deploy an update, push the changes to the `gh-pages` branch.

## Running locally

Requires Python 3 (for the dev server) and Node.js (for tests).

```bash
npm install        # install test dependencies
npm run dev        # serve at http://localhost:3000
npm test           # run the test suite
npm run test:watch # run tests in watch mode
```

The app is plain HTML, CSS, and JavaScript with no build step. The dev server is only needed because ES module imports are blocked on `file://` URLs by the browser.

## Project structure

```
index.html        # single page app
css/styles.css    # all styling, dark/light theme via CSS custom properties
js/app.js         # DOM wiring, event handlers
js/url-utils.js   # pure URL-stripping logic
icons/icons.svg   # SVG sprite (all icons defined once, referenced via <use>)
tests/            # Vitest test suite
plans/            # feature planning documents
```

## Testing approach

The project is developed with strict TDD. Tests use [Vitest](https://vitest.dev) and [jsdom](https://github.com/jsdom/jsdom) to load and query the real `index.html`. The test suite covers page structure, accessibility attributes, and all interactive behaviour via `initApp`.
