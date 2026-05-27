import { describe, it, expect } from "vitest";
import { stripQueryParams } from "../js/url-utils.js";

describe("stripQueryParams", () => {
  it("strips query params from a URL", () => {
    expect(stripQueryParams("https://example.com/page?foo=bar&baz=qux")).toBe(
      "https://example.com/page",
    );
  });
});
