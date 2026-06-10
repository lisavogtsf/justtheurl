import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { JSDOM } from "jsdom";
import { describe, it, expect, vi } from "vitest";
import { initPlusApp } from "../js/app-plus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadPlusPage(search = "") {
  const html = readFileSync(resolve(__dirname, "../justtheurlplus/index.html"), "utf-8");
  const url = "http://localhost/justtheurlplus" + search;
  return new JSDOM(html, { url }).window.document;
}

function makeClipboard() {
  return { writeText: vi.fn().mockResolvedValue(undefined) };
}

function setupDoc() {
  const doc = loadPlusPage();
  doc.defaultView.navigator.clipboard = makeClipboard();
  doc.defaultView.matchMedia = () => ({ matches: false });
  initPlusApp(doc);
  return doc;
}

function typeUrl(doc, url) {
  const input = doc.querySelector('input[type="url"]');
  input.value = url;
  input.dispatchEvent(new doc.defaultView.Event("input"));
  return input;
}

describe("justtheurlplus page title", () => {
  it('contains "justtheurl+" in the page text', () => {
    const doc = loadPlusPage();
    expect(doc.body.textContent).toContain("justtheurl");
    expect(doc.body.textContent).toContain("+");
  });

  it('has an h1 with "just", "the", "url" spans', () => {
    const doc = loadPlusPage();
    const h1 = doc.querySelector("h1");
    expect(h1).not.toBeNull();
    const spans = h1.querySelectorAll("span");
    const texts = [...spans].map((s) => s.textContent);
    expect(texts).toContain("just");
    expect(texts).toContain("the");
    expect(texts).toContain("url");
  });

  it("has a span with the plus character in the h1", () => {
    const doc = loadPlusPage();
    const plusSpan = doc.querySelector("h1 span.title__word--plus");
    expect(plusSpan).not.toBeNull();
    expect(plusSpan.textContent).toBe("+");
  });
});

describe("justtheurlplus smart stripping", () => {
  it("preserves YouTube v= param when stripping utm_source", () => {
    const doc = setupDoc();
    typeUrl(doc, "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter");
    expect(doc.querySelector("output").value).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("removes utm_source from a generic domain", () => {
    const doc = setupDoc();
    typeUrl(doc, "https://example.com/page?utm_source=newsletter&custom=value");
    expect(doc.querySelector("output").value).toBe(
      "https://example.com/page?custom=value",
    );
  });

  it("shows param count in status (no warning link) for YouTube", () => {
    const doc = setupDoc();
    typeUrl(doc, "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter");
    const status = doc.querySelector(".url-status");
    expect(status.textContent).toBe("1 param removed");
    expect(doc.querySelector(".url-status a")).toBeNull();
  });

  it('shows "already clean" when nothing is stripped', () => {
    const doc = setupDoc();
    typeUrl(doc, "https://example.com/page?custom=value");
    expect(doc.querySelector(".url-status").textContent).toBe("already clean");
  });

  it("sets output data-state to stripped when params are removed", () => {
    const doc = setupDoc();
    typeUrl(doc, "https://example.com/page?utm_source=x");
    expect(doc.querySelector("output").dataset.state).toBe("stripped");
  });
});

describe("justtheurlplus url= preload", () => {
  const originalUrl =
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter";

  function setupPreloadDoc() {
    const search = "?url=" + encodeURIComponent(originalUrl);
    const doc = loadPlusPage(search);
    doc.defaultView.navigator.clipboard = makeClipboard();
    doc.defaultView.matchMedia = () => ({ matches: false });
    initPlusApp(doc);
    return doc;
  }

  it("pre-populates the input with the original URL from url= param", () => {
    const doc = setupPreloadDoc();
    expect(doc.querySelector('input[type="url"]').value).toBe(originalUrl);
  });

  it("strips the preloaded URL and shows the result in the output", () => {
    const doc = setupPreloadDoc();
    expect(doc.querySelector("output").value).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("shows the param count in status after preloading", () => {
    const doc = setupPreloadDoc();
    expect(doc.querySelector(".url-status").textContent).toBe("1 param removed");
  });

  it("leaves the input empty when no url= param is present", () => {
    const doc = setupDoc();
    expect(doc.querySelector('input[type="url"]').value).toBe("");
  });

  it("clears the url= query param from the address bar when the clear button is clicked", () => {
    const doc = setupPreloadDoc();
    doc.querySelector("button#clear").click();
    expect(doc.defaultView.location.search).toBe("");
  });

  it("clears the url= query param from the address bar when Escape is pressed", () => {
    const doc = setupPreloadDoc();
    const input = doc.querySelector('input[type="url"]');
    input.dispatchEvent(new doc.defaultView.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(doc.defaultView.location.search).toBe("");
  });
});

describe("justtheurlplus page structure", () => {
  it("has a url input field", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector('input[type="url"]')).not.toBeNull();
  });

  it("has a placeholder that describes smart stripping", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector('input[type="url"]').getAttribute("placeholder")).toBe(
      "Paste a URL — tracking removed, essentials kept",
    );
  });

  it("has an output element", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector("output")).not.toBeNull();
  });

  it("has a copy button", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector("button#copy")).not.toBeNull();
  });

  it("has a footer element", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector("footer")).not.toBeNull();
  });

  it("footer notes local processing", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector("footer").textContent).toContain(
      "All URLs are processed locally",
    );
  });
});
