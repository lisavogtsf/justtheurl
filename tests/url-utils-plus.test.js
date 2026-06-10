import { describe, it, expect } from "vitest";
import { smartStripUrl } from "../js/url-utils-plus.js";

describe("smartStripUrl", () => {
  describe("tracking params are removed", () => {
    it("removes utm_source", () => {
      const { result } = smartStripUrl("https://example.com/page?utm_source=newsletter");
      expect(result).toBe("https://example.com/page");
    });

    it("removes all utm_ params", () => {
      const { result } = smartStripUrl(
        "https://example.com/page?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e",
      );
      expect(result).toBe("https://example.com/page");
    });

    it("removes fbclid", () => {
      const { result } = smartStripUrl("https://example.com/page?fbclid=abc123");
      expect(result).toBe("https://example.com/page");
    });

    it("removes gclid", () => {
      const { result } = smartStripUrl("https://example.com/page?gclid=abc123");
      expect(result).toBe("https://example.com/page");
    });

    it("removes _ga", () => {
      const { result } = smartStripUrl("https://example.com/page?_ga=2.123.456");
      expect(result).toBe("https://example.com/page");
    });

    it("removes msclkid", () => {
      const { result } = smartStripUrl("https://example.com/page?msclkid=abc");
      expect(result).toBe("https://example.com/page");
    });
  });

  describe("unknown params are preserved", () => {
    it("preserves an unrecognised param on a generic domain", () => {
      const { result } = smartStripUrl("https://example.com/page?custom=value");
      expect(result).toBe("https://example.com/page?custom=value");
    });

    it("removes only tracking params when mixed with unknown params", () => {
      const { result } = smartStripUrl(
        "https://example.com/page?custom=value&utm_source=newsletter",
      );
      expect(result).toBe("https://example.com/page?custom=value");
    });
  });

  describe("functional params are preserved on YouTube", () => {
    it("preserves v= on youtube.com", () => {
      const { result } = smartStripUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter",
      );
      expect(result).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("preserves t= (timestamp) on youtube.com", () => {
      const { result } = smartStripUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42&utm_source=foo",
      );
      expect(result).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42");
    });

    it("preserves list= on youtube.com", () => {
      const { result } = smartStripUrl(
        "https://www.youtube.com/watch?v=abc&list=PLxxx&utm_campaign=bar",
      );
      expect(result).toBe("https://www.youtube.com/watch?v=abc&list=PLxxx");
    });
  });

  describe("functional params are preserved on Google", () => {
    it("preserves q= on google.com", () => {
      const { result } = smartStripUrl(
        "https://www.google.com/search?q=hello+world&utm_source=something",
      );
      expect(result).toBe("https://www.google.com/search?q=hello+world");
    });
  });

  describe("functional params are preserved on DuckDuckGo", () => {
    it("preserves q= on duckduckgo.com", () => {
      const { result } = smartStripUrl(
        "https://duckduckgo.com/?q=hello&utm_source=foo",
      );
      expect(result).toBe("https://duckduckgo.com/?q=hello");
    });
  });

  describe("functional params are preserved on Bing", () => {
    it("preserves q= on bing.com", () => {
      const { result } = smartStripUrl(
        "https://www.bing.com/search?q=hello&form=QBLH&qs=n",
      );
      expect(result).toBe("https://www.bing.com/search?q=hello");
    });
  });

  describe("state and paramCount", () => {
    it("returns state 'stripped' when tracking params are removed", () => {
      const { state } = smartStripUrl("https://example.com/page?utm_source=x");
      expect(state).toBe("stripped");
    });

    it("returns state 'clean' when no params are removed", () => {
      const { state } = smartStripUrl("https://example.com/page?custom=value");
      expect(state).toBe("clean");
    });

    it("returns state 'clean' for a URL with no params", () => {
      const { state } = smartStripUrl("https://example.com/page");
      expect(state).toBe("clean");
    });

    it("returns paramCount equal to the number of removed params", () => {
      const { paramCount } = smartStripUrl(
        "https://www.youtube.com/watch?v=abc&utm_source=x&utm_medium=y",
      );
      expect(paramCount).toBe(2);
    });

    it("returns paramCount 0 when nothing is removed", () => {
      const { paramCount } = smartStripUrl("https://example.com/page?custom=value");
      expect(paramCount).toBe(0);
    });
  });

  describe("URL parsing (same behaviour as stripQueryParams)", () => {
    it("handles a protocol-less URL by prepending https://", () => {
      const { result, state } = smartStripUrl("example.com?utm_source=x");
      expect(result).toBe("https://example.com/");
      expect(state).toBe("stripped");
    });

    it("returns state 'empty' for whitespace-only input", () => {
      const { result, state } = smartStripUrl("   ");
      expect(result).toBe("");
      expect(state).toBe("empty");
    });

    it("returns state 'invalid' for input containing a space", () => {
      const { result, state } = smartStripUrl("hello world");
      expect(result).toBe("");
      expect(state).toBe("invalid");
    });

    it("returns state 'invalid' for a single word with no dot", () => {
      const { result, state } = smartStripUrl("helloworld");
      expect(result).toBe("");
      expect(state).toBe("invalid");
    });

    it("preserves hashes entirely", () => {
      const { result } = smartStripUrl(
        "https://example.com/page?utm_source=x#section-2",
      );
      expect(result).toBe("https://example.com/page#section-2");
    });
  });
});
