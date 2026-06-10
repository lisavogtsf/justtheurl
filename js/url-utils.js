// A hash fragment is treated as a tracking param if it contains "=",
// indicating a key=value pair (e.g. #ref=newsletter, #utm_source=twitter, #_=_).
// Plain anchors like #section-2 or #top do not contain "=" and are left alone.
const HASH_CONTAINS_KEY_VALUE = /=/;

export function stripQueryParams(rawUrl) {
  // Remove surrounding whitespace so "  https://example.com " is treated as a valid URL.
  const trimmed = rawUrl.trim();
  if (!trimmed) return { result: "", state: "empty" };

  // Reject anything with a space before attempting URL parsing.
  // Unencoded spaces are never valid in any URL — their presence means the
  // input is plain text, not a URL. This guard must come before new URL()
  // because Chrome's URL parser encodes spaces rather than throwing, so
  // "hello world" would otherwise silently become "https://hello%20world/".
  if (trimmed.includes(" ")) {
    return { result: "", state: "invalid" };
  }

  // Attempt to parse as a full URL. If that fails, try prepending "https://"
  // but only when the input contains a dot — the minimum signal that it could
  // be a protocol-less domain like "example.com?foo=bar". Single words like
  // "helloworld" are syntactically valid hostnames per the URL spec, so without
  // the dot check they would silently become "https://helloworld/" instead of
  // being rejected as invalid.
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    if (!trimmed.includes(".")) {
      return { result: "", state: "invalid" };
    }
    try {
      parsed = new URL("https://" + trimmed);
    } catch {
      return { result: "", state: "invalid" };
    }
  }

  // Record what was present before stripping, so we can report the correct state.
  const hadQuery = parsed.search !== "";
  const hadTrackingHash = HASH_CONTAINS_KEY_VALUE.test(parsed.hash.slice(1));
  const paramCount =
    (hadQuery ? new URLSearchParams(parsed.search).size : 0) +
    (hadTrackingHash ? new URLSearchParams(parsed.hash.slice(1)).size : 0);

  // Always remove the query string. Remove the hash only if it looks like tracking.
  parsed.search = "";
  if (hadTrackingHash) parsed.hash = "";

  const result = parsed.toString();
  // "stripped" means something was actually removed; "clean" means the URL
  // was valid but had nothing to strip.
  const state = hadQuery || hadTrackingHash ? "stripped" : "clean";
  return { result, state, paramCount };
}
