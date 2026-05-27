# V3 Plan: Accessibility & Mobile UX

## Context

The core mobile use case is: copy a URL from another app → open justtheurl → paste → copy the clean result → done. Every extra tap is friction. V3 focuses on removing that friction and filling accessibility gaps.

---

## Improvements

### 1. Auto-copy on strip (highest impact)

When the URL is stripped, copy it to the clipboard immediately — no button tap required in the happy path. The copy button stays as a visible fallback for re-copying.

**Why:** On mobile, switching between apps to paste and then having to tap "Copy" is the biggest point of friction. Eliminating it makes the tool feel instant.

**Caveat:** `navigator.clipboard.writeText()` requires a user-initiated event. The `input` event qualifies in modern mobile browsers, but we should test and fall back gracefully if it fails.

---

### 2. Copy feedback

The copy button (and auto-copy) should briefly show a "Copied ✓" state for ~2 seconds, then revert to "Copy". On mobile there is no hover state, so users need an explicit signal that the action succeeded.

**Testable:** We can test that the button label changes after a copy action.

---

### 3. Add a `<label>` for the URL input

Currently the input has no associated `<label>`. This is an accessibility gap — screen readers have no way to describe what the field is for.

The label can be visually hidden (using a `.sr-only` utility class) so it doesn't affect the visual design.

**Testable:** Test that a `<label>` element exists and is associated with the input via `for`/`id`.

---

### 4. `aria-live="polite"` on the output

The `<output>` element currently changes value when a URL is stripped, but screen readers won't announce this without `aria-live="polite"`. Adding it means the stripped URL is read aloud automatically.

**Testable:** Test that the output element has the `aria-live` attribute.

---

### 5. Input font size ≥ 16px

iOS Safari auto-zooms the page when a focused input has a font size below 16px. This is disorienting on mobile. We should confirm our input meets this threshold and fix it if not.

**Not testable** (CSS value) — visual/manual check.

---

### 6. Clear button inside the input

A small ✕ button inside the input field lets users reset without reloading the page. It should only appear when the input has a value.

**Testable:** Test that a clear button element exists.

---

### 7. Auto-focus the input

Focus the input on page load so that a mobile user arriving on the page can paste immediately without tapping the field first.

This is debatable — auto-focus opens the keyboard on mobile, which can be jarring. But for a paste-and-go tool, arriving keyboard-ready is likely a net positive.

**Not testable** in jsdom (focus state isn't meaningful without a real browser).

---

## Order of implementation

1. Label + aria-live (accessibility gaps, low complexity)
2. Auto-copy on strip + copy feedback (highest UX impact)
3. Clear button
4. Auto-focus + font size check (simple, last)
