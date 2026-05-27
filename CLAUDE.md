# justtheurl

A minimal URL utility web app.

## Development approach: Test-Driven Development

**Always follow the Red → Green → Refactor cycle:**

1. **Red** — write a failing test first. Do not write implementation code before a test exists.
2. **Green** — write the absolute minimum code to make the failing test pass. Do not add anything not required by the test — no extra styling, no extra attributes, no anticipating future tests. If it isn't tested, it doesn't get written.
3. **Refactor** — clean up code and tests while keeping tests green.

Never skip the failing-test step. If asked to add a feature or fix a bug, start by writing (or identifying) the test that demonstrates the missing behavior.

## Testing stack

- **Runner:** Vitest (`npm test` for a single run, `npm run test:watch` for watch mode)
- **DOM:** jsdom (loaded via JSDOM in tests)
- **Test files:** `tests/` directory, named `*.test.js`

## Conventions

- Tests load `index.html` via the filesystem and query the DOM with jsdom.
- Keep tests focused on observable behavior (text, structure, interaction), not implementation details.

## Code style

- **Formatter: Prettier.** All files (JS, CSS, HTML) should follow Prettier's default output. Do not write code that would conflict with Prettier formatting.
- **Always use semicolons** at the end of JavaScript statements — no exceptions.
- Use ES module syntax (`import`/`export`), not CommonJS (`require`/`module.exports`).
- Prefer `const` over `let`; avoid `var`.
