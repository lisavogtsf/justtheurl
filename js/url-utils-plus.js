const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "fbid",
  "gclid",
  "gclsrc",
  "dclid",
  "_ga",
  "_gid",
  "msclkid",
  "ttclid",
  "li_fat_id",
  "mc_eid",
  "yclid",
  "ref",
  "referrer",
  "source",
  "igshid",
  "s_kwcid",
  "ef_id",
  "affiliate_id",
  "zanpid",
]);

const FUNCTIONAL_PARAMS = new Map([
  ["youtube.com", new Set(["v", "t", "list", "index", "start"])],
  ["youtu.be", new Set(["t"])],
  ["google.com", new Set(["q", "tbm", "tbs", "start", "num", "hl"])],
  ["bing.com", new Set(["q", "first", "count"])],
  ["duckduckgo.com", new Set(["q", "ia", "iax"])],
  ["maps.google.com", new Set(["q", "ll", "z", "destination", "origin", "saddr", "daddr"])],
  ["amazon.com", new Set(["keywords", "k", "s", "rh", "node"])],
  ["spotify.com", new Set(["context", "play"])],
]);

function getFunctionalParams(hostname) {
  for (const [domain, params] of FUNCTIONAL_PARAMS) {
    if (hostname === domain || hostname.endsWith("." + domain)) return params;
  }
  return null;
}

export function smartStripUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { result: "", state: "empty" };

  if (trimmed.includes(" ")) {
    return { result: "", state: "invalid" };
  }

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

  const functionalParams = getFunctionalParams(parsed.hostname);
  const params = new URLSearchParams(parsed.search);
  let removedCount = 0;

  for (const key of [...params.keys()]) {
    const shouldRemove = functionalParams
      ? !functionalParams.has(key)
      : TRACKING_PARAMS.has(key);
    if (shouldRemove) {
      params.delete(key);
      removedCount++;
    }
  }

  const newSearch = params.toString();
  parsed.search = newSearch ? "?" + newSearch : "";

  const result = parsed.toString();
  const state = removedCount > 0 ? "stripped" : "clean";
  return { result, state, paramCount: removedCount };
}
