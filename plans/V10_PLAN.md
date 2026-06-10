# Plan: Contextual Warnings + /justtheurlplus Smart-Strip Page

## Context

The current app strips all query params from any URL. That's too aggressive for URLs where params are functional content, not tracking (e.g. YouTube's `v=` identifies the video). We want to:

1. Warn users on the front page when stripping might break their URL, linking them to a smarter alternative.
2. Build `/justtheurlplus` — an opt-in page that preserves functional params and only removes confirmed tracking params.

## Approach

### Part 1: Front-page warning

Add a `shouldWarn(hostname)` function to `js/url-utils.js`. It checks the parsed URL's hostname against a hardcoded list of domains where query params are often functional:

- `youtube.com`, `youtu.be` — `v=` is the video ID
- `google.com` — `q=` is the search query; `/maps` routes use many params
- `bing.com` — `q=` is the search query
- `duckduckgo.com` — `q=` is the search query
- `maps.google.com` — location/directions params

When `state === "stripped"` AND `shouldWarn(hostname)` returns true, **replace the status line text** with:

> ⚠ Stripping may break this URL — [try the smarter version →](/justtheurlplus)

The link goes to `/justtheurlplus`. No other visual change; no extra DOM elements.

### Part 2: Smart strip logic

New file `js/url-utils-plus.js` exports `smartStripUrl(rawUrl)` — same return shape as `stripQueryParams` (`{ result, state, paramCount }`).

Logic:
1. Parse the URL the same way (same fallback for missing https://).
2. Build a `keepParams` Set for the hostname:
   - Always keep params in a per-domain `FUNCTIONAL_PARAMS` map.
   - Always remove params in `TRACKING_PARAMS` set.
   - For any param not in either list: **keep it** (conservative — unknown = preserve).
3. Remove only confirmed tracking params from query string (never clear the whole search).
4. Preserve hashes entirely (plus page doesn't touch hashes).

**`TRACKING_PARAMS`** (always remove, any domain):
`utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id, fbclid, fbid, gclid, gclsrc, dclid, _ga, _gid, msclkid, ttclid, li_fat_id, mc_eid, yclid, ref, referrer, source, igshid, s_kwcid, ef_id, affiliate_id, zanpid`

**`FUNCTIONAL_PARAMS`** (never remove, domain-specific):
- `youtube.com`, `youtu.be`: `v, t, list, index, start`
- `google.com`: `q, tbm, tbs, start, num, hl`
- `bing.com`: `q, first, count`
- `duckduckgo.com`: `q, ia, iax`
- `maps.google.com`: `q, ll, z, destination, origin, saddr, daddr`
- `amazon.com`: `keywords, k, s, rh, node`
- `spotify.com`: `context, play`

**`paramCount`** = number of params actually removed (not total params present).

### Part 3: /justtheurlplus page

New file `justtheurlplus.html` — mirrors `index.html` structure but:
- Title changes: `just the url` + a `+` suffix character (styled differently, e.g. `<span class="title__word--plus">+</span>`)
- Subtitle or small note under the h1: "Removes only tracking — keeps params your URL needs"
- Footer note: "Smarter stripping using a curated list of tracking and functional parameters."
- Imports `js/app-plus.js` instead of `js/app.js`

New file `js/app-plus.js` — identical to `js/app.js` but imports and calls `smartStripUrl` instead of `stripQueryParams`. No warning logic (the plus page doesn't need to warn about itself).

**Alternative considered and rejected**: Parameterizing `initApp()` to accept a strip function. Keeping two separate app files is simpler to test independently and avoids conditional logic in the shared module.

### Files to create/modify

| File | Action |
|------|--------|
| `js/url-utils.js` | Add `shouldWarn(hostname)` export |
| `tests/url-utils.test.js` | Add tests for `shouldWarn` |
| `js/app.js` | Render warning in status line when `shouldWarn` returns true and state is stripped |
| `tests/index.test.js` | Add tests for warning rendering + link to /justtheurlplus |
| `js/url-utils-plus.js` | New — `smartStripUrl` logic |
| `tests/url-utils-plus.test.js` | New — tests for `smartStripUrl` |
| `justtheurlplus.html` | New — plus page HTML |
| `js/app-plus.js` | New — plus page app wiring |
| `tests/justtheurlplus.test.js` | New — DOM tests for plus page |

## Commit sequence (one logical change per commit)

1. `shouldWarn`: tests + implementation in `url-utils.js`
2. Front-page warning UI: tests + `app.js` changes
3. `smartStripUrl`: tests + `url-utils-plus.js`
4. `/justtheurlplus` page: `justtheurlplus.html` + `app-plus.js` + DOM tests

## Addendum: implementation changes from plan

### Deviations from the plan

**smart strip logic changed**: The plan said "for any param not in either list, keep it (conservative)." During implementation a test for Bing (`form=QBLH&qs=n`) revealed this was wrong for known domains. The final logic is: for domains in `FUNCTIONAL_PARAMS`, remove everything *not* in the functional list (aggressive); for unknown domains, remove only confirmed tracking params (conservative). This is a better user experience — on known domains we know exactly what's needed.

**`justtheurlplus.html` moved to `justtheurlplus/index.html`**: Needed for the Python dev server (`python3 -m http.server`) to serve the page at `/justtheurlplus`. Python doesn't do extensionless URL resolution; a directory with `index.html` triggers a redirect instead. All asset paths updated to root-relative (`/css/styles.css`, `/js/app-plus.js`, etc.).

### Features added beyond the plan

**Warning link encodes the original URL** (`?url=`): Clicking "try the smarter version →" passes the full original URL as a query parameter so the plus page pre-populates and strips immediately — the user doesn't have to paste again. `history.replaceState` clears the query param from the address bar when the user clicks Clear or presses Escape.

**Plus page copy differentiation** (five additional commits):
- Input placeholder: `Paste a URL — tracking removed, essentials kept`
- Status messages: `1 tracking param removed` / `already clean — no known tracking params`
- Footer back-link: `← simple stripping` linking to `/`
- Screen reader label: `URL to remove tracking from`
- Output `::before` placeholder: `[URL with tracking removed]` via `plus-page` body class + CSS override

## Verification

- `npm test` passes with no stderr output after each commit
- `npm run lint` passes
- Manual: paste `https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter` → front page shows warning with link
- Manual: visit `/justtheurlplus`, paste same URL → output is `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (utm removed, v= kept, paramCount=1)
- Manual: paste `https://example.com?utm_source=newsletter` on front page → normal "1 param removed" status (no warning, not a warn-domain)
