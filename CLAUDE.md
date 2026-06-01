# Development guidelines

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

- Keep tests focused on observable behavior (text, structure, interaction), not implementation details.
- Add new tests to the **end** of the test file by default. The only exception is when a new test directly relates to an existing `describe` block — in that case, add it inside that block to keep related behavior grouped. Never insert a new `describe` block above existing ones.

## Test output

A passing test suite is not sufficient — the output must also be clean. Treat any `stderr` lines in Vitest output as failures, even when all tests report as passed.

Errors written to stderr (such as uncaught TypeErrors inside event listeners) indicate real bugs that jsdom has swallowed rather than propagated. They will not appear in the test result count, so they are easy to miss, but they often signal behaviour that is broken in the browser even though the assertion still passes.

After every test run, check for `stderr |` lines in the output. If any are present, find the root cause and fix it before moving on — do not commit with stderr output present.

## Git commits

Whenever the agent makes a commit, the message must end with:

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

This distinguishes agent-made commits from commits made manually by the user.

## Code style

- **Formatter: Prettier.** All files (JS, CSS, HTML) should follow Prettier's default output. Do not write code that would conflict with Prettier formatting.
- **Always use semicolons** at the end of JavaScript statements — no exceptions.
- Use ES module syntax (`import`/`export`), not CommonJS (`require`/`module.exports`).
- Prefer `const` over `let`; avoid `var`.
