# MVP Plan: justtheurl

## What we're building

1. A text input — paste a URL in
2. A result display — shows the URL with everything after `?` stripped
3. A copy button — puts the clean URL on the clipboard

## How we split the code

Two distinct concerns, two files:

- **`js/url-utils.js`** — a pure function `stripQueryParams(url)`. Takes a string, returns a string. No DOM, no side effects.
- **`js/app.js`** — wires the DOM: listens for input, calls the function, updates the result display, handles the copy button.

Keeping the logic pure and separate from the DOM makes it trivially testable.

## Test files and order of work

### `tests/url-utils.test.js` — pure function, no DOM needed
1. Strips query params from a URL → `https://example.com/page?foo=bar` becomes `https://example.com/page`

### `tests/index.test.js` additions — DOM structure
2. Page has a URL input field
3. Page has a result display area
4. Page has a copy button

### `tests/index.test.js` additions — DOM behavior
5. Typing into the input updates the result display with the stripped URL

### Clipboard note
jsdom doesn't implement the clipboard API, so the copy button test requires mocking `navigator.clipboard.writeText` with Vitest's `vi.fn()`. Straightforward — handled when we get there.

## Order of implementation

Each step is Red → Green → move on:

1. `stripQueryParams` function + tests
2. Input field in HTML + test
3. Result display area in HTML + test
4. Copy button in HTML + test
5. Wire input → strip → display in `app.js` + behavior test
6. Wire copy button → clipboard in `app.js` + mocked test
