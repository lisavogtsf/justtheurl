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

  it("strips the #_=_ tracking hash (contains '=')", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page#_=_",
    );
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("stripped");
  });

  it("preserves a plain anchor hash without '=' and returns state 'clean'", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page#section-2",
    );
    expect(result).toBe("https://example.com/page#section-2");
    expect(state).toBe("clean");
  });

  it("strips both query params and a tracking hash", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page?foo=bar#ref=x",
    );
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("stripped");
  });

  it("strips query params but preserves a plain anchor hash", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page?foo=bar#section",
    );
    expect(result).toBe("https://example.com/page#section");
    expect(state).toBe("stripped");
  });

  it("handles a protocol-less URL by prepending https://", () => {
    const { result, state } = stripQueryParams("example.com?foo=bar");
    expect(result).toBe("https://example.com/");
    expect(state).toBe("stripped");
  });

  it("returns state 'invalid' for input that is not a recognisable URL", () => {
    const { result, state } = stripQueryParams("hello world");
    expect(result).toBe("");
    expect(state).toBe("invalid");
  });

  it("returns state 'invalid' for a single word with no dot (not a domain)", () => {
    const { result, state } = stripQueryParams("helloworld");
    expect(result).toBe("");
    expect(state).toBe("invalid");
  });

  it("returns state 'empty' for whitespace-only input", () => {
    const { result, state } = stripQueryParams("   ");
    expect(result).toBe("");
    expect(state).toBe("empty");
  });

  it("strips everything after the first '?' even when multiple '?' appear", () => {
    const { result, state } = stripQueryParams(
      "https://example.com/page?a=1?b=2",
    );
    expect(result).toBe("https://example.com/page");
    expect(state).toBe("stripped");
  });

  it("returns paramCount: 1 when one query param is stripped", () => {
    const { paramCount } = stripQueryParams("https://example.com/page?foo=bar");
    expect(paramCount).toBe(1);
  });

  it("returns paramCount: 2 when two query params are stripped", () => {
    const { paramCount } = stripQueryParams("https://example.com/page?foo=bar&baz=qux");
    expect(paramCount).toBe(2);
  });

  it("returns paramCount: 0 for a clean URL with no query params", () => {
    const { paramCount } = stripQueryParams("https://example.com/page");
    expect(paramCount).toBe(0);
  });

  it("returns paramCount: 1 when only a tracking hash is stripped", () => {
    const { paramCount } = stripQueryParams("https://example.com/page#ref=foo");
    expect(paramCount).toBe(1);
  });

  it("returns paramCount: 2 when a tracking hash with two key-value pairs is stripped", () => {
    const { paramCount } = stripQueryParams("https://example.com/page#ref=x&stuff=more");
    expect(paramCount).toBe(2);
  });

  it("counts both query params and multiple hash params together", () => {
    const { paramCount } = stripQueryParams("https://example.com/page?foo=bar#ref=x&stuff=more");
    expect(paramCount).toBe(3);
  });
});
