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
});
