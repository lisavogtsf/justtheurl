import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { JSDOM } from "jsdom";
import { describe, it, expect, vi } from "vitest";
import { initPlusApp } from "../js/app-plus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadPlusPage() {
  const html = readFileSync(resolve(__dirname, "../justtheurlplus/index.html"), "utf-8");
  return new JSDOM(html).window.document;
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

describe("justtheurlplus page structure", () => {
  it("has a url input field", () => {
    const doc = loadPlusPage();
    expect(doc.querySelector('input[type="url"]')).not.toBeNull();
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
