import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi } from 'vitest';
import { initApp } from '../js/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadPage() {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  return new JSDOM(html).window.document;
}

describe('page title', () => {
  it('contains the text "justtheurl"', () => {
    const doc = loadPage();
    expect(doc.body.textContent).toContain('justtheurl');
  });

  it('displays the title as an h1 with "just", "the", and "url" as three distinct spans', () => {
    const doc = loadPage();
    const h1 = doc.querySelector('h1');
    expect(h1).not.toBeNull();
    const words = h1.querySelectorAll('span');
    expect(words).toHaveLength(3);
    expect(words[0].textContent).toBe('just');
    expect(words[1].textContent).toBe('the');
    expect(words[2].textContent).toBe('url');
  });

  it('gives each word span a distinct BEM class for individual styling', () => {
    const doc = loadPage();
    expect(doc.querySelector('h1 span.title__word--primary')).not.toBeNull();
    expect(doc.querySelector('h1 span.title__word--secondary')).not.toBeNull();
    expect(doc.querySelector('h1 span.title__word--tertiary')).not.toBeNull();
  });
});

describe('url input', () => {
  it('has a URL input field', () => {
    const doc = loadPage();
    expect(doc.querySelector('input[type="url"]')).not.toBeNull();
  });
});

describe('result display', () => {
  it('has a result display area', () => {
    const doc = loadPage();
    expect(doc.querySelector('output')).not.toBeNull();
  });
});

describe('copy button', () => {
  it('has a copy button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#copy')).not.toBeNull();
  });
});

describe('initApp', () => {
  it('when the input changes, displays the stripped URL in the output', () => {
    const doc = loadPage();
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar&baz=qux';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').value).toBe('https://example.com/page');
  });

  it('when the copy button is clicked, copies the stripped URL to the clipboard', () => {
    const doc = loadPage();
    const writeText = vi.fn().mockResolvedValue(undefined);
    doc.defaultView.navigator.clipboard = { writeText };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    doc.querySelector('button#copy').click();

    expect(writeText).toHaveBeenCalledWith('https://example.com/page');
  });
});
