import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { JSDOM } from 'jsdom';
import { describe, it, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadPage() {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  return new JSDOM(html).window.document;
}

describe('index.html', () => {
  it('contains the text "justtheurl"', () => {
    const doc = loadPage();
    expect(doc.body.textContent).toContain('justtheurl');
  });
});

describe('page title', () => {
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
});

describe('page title styling', () => {
  it('uses system-ui font for the title', () => {
    const doc = loadPage();
    const styles = doc.querySelector('style').textContent;
    expect(styles).toContain('system-ui');
  });

  it('gives each word span a distinct class for individual styling', () => {
    const doc = loadPage();
    expect(doc.querySelector('h1 span.just')).not.toBeNull();
    expect(doc.querySelector('h1 span.the')).not.toBeNull();
    expect(doc.querySelector('h1 span.url')).not.toBeNull();
  });
});
