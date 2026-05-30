import { describe, it, expect } from "vitest";
import { stripQueryParams } from "../js/url-utils.js";

describe("stripQueryParams", () => {
  it("strips query params from a URL", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page?foo=bar&baz=qux",
    );
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("stripped");
  });

  it("returns state 'clean' when the URL has no query params or tracking hash", () => {
    const { result, state } = stripQueryParams("https://example.com/page");
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("clean");
  });

  it("strips a tracking hash containing '=' and returns state 'stripped'", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page#ref=newsletter",
    );
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("stripped");
  });
});
