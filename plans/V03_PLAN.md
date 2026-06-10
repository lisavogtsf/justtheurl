# V3 Plan: Accessibility & Mobile UX

## Context

The core mobile use case is: copy a URL from another app → open justtheurl → strip it → use the clean result. Every extra tap is friction. V3 focuses on removing that friction and filling accessibility gaps.

---

## UI structure

To keep the interface simple, controls are grouped by where they belong:

```
[ URL input field                    ] [ Paste ] [ ✕ ]
[ stripped URL will appear here          ]
[ Copy ]  [ Open ]
```

- **Paste** and **✕** (clear) are small icon buttons that live with the input
- **Copy** and **Open** are paired action buttons that live below the output
- No action is more than one tap away

---

## Improvements

### Paste button (highest mobile impact)

A small icon button beside the input that reads from the clipboard and populates the field. Eliminates the long-press → "Paste" flow on mobile.

Combined with auto-copy on strip, the full happy path on mobile becomes: **tap Paste → done**. The URL is stripped and already in the clipboard in one tap.

Uses `navigator.clipboard.readText()`. May prompt for clipboard-read permission on first use — this is expected browser behaviour.

**Testable:** Test that a paste button element exists.

---

### Auto-copy on strip

When a URL is stripped, copy it to the clipboard immediately — no extra tap required. The Copy button becomes a visible fallback for re-copying.

**Caveat:** `navigator.clipboard.writeText()` requires a user-initiated event. The `input` event qualifies in modern mobile browsers, but we should fall back gracefully if it fails.

**Testable:** We can test that the clipboard is written when the input changes.

---

### Copy feedback

After copying (auto or manual), the Copy button briefly shows "Copied ✓" for ~2 seconds, then reverts. On mobile there is no hover state, so users need an explicit signal the action succeeded.

**Testable:** Test that the button text changes after a copy action.

---

### Open button

A button beside Copy that opens the stripped URL in a new tab. Useful when the user wants to verify the destination or navigate directly without pasting elsewhere.

Should be disabled or hidden when there is no stripped URL.

**Testable:** Test that an open button element exists.

---

### Clear button (✕) inside the input

A small ✕ button inside the input field to quickly reset without reloading. Appears only when the input has a value.

**Testable:** Test that a clear button element exists.

---

### Add a `<label>` for the URL input

Currently the input has no associated `<label>`. Screen readers have no way to describe what the field is for. The label can be visually hidden with a `.sr-only` class so it doesn't affect the visual design.

**Testable:** Test that a `<label>` element is associated with the input via `for`/`id`.

---

### `aria-live="polite"` on the output

Screen readers won't announce changes to the output element without this. Adding it means the stripped URL is read aloud automatically when it appears.

**Testable:** Test that the output element has the `aria-live` attribute.

---

### Auto-focus the input

Focus the input on page load so users who prefer to manually type or long-press paste don't have to tap the field first. Complements the paste button — two paths to the same starting point.

**Not testable** in jsdom (focus state isn't meaningful without a real browser).

---

### Input font size ≥ 16px

iOS Safari auto-zooms the page when a focused input has a font size below 16px. This is disorienting on mobile.

**Not testable** (CSS value) — visual/manual check.

---

## Order of implementation

1. Label + aria-live (accessibility gaps, low complexity)
2. Paste button (highest mobile UX impact)
3. Auto-copy on strip + copy feedback
4. Open button
5. Clear button
6. Auto-focus + font size check (simple, last)
