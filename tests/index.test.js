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

  it('has the class url-input', () => {
    const doc = loadPage();
    expect(doc.querySelector('input.url-input')).not.toBeNull();
  });

  it('has an associated label', () => {
    const doc = loadPage();
    const input = doc.querySelector('input.url-input');
    const label = doc.querySelector(`label[for="${input.id}"]`);
    expect(label).not.toBeNull();
  });

  it('has a paste button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#paste')).not.toBeNull();
  });

  it('paste button has a title matching its aria-label', () => {
    const doc = loadPage();
    const btn = doc.querySelector('button#paste');
    expect(btn.getAttribute('title')).toBe(btn.getAttribute('aria-label'));
  });

  it('has a clear button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#clear')).not.toBeNull();
  });

  it('clear button has a title matching its aria-label', () => {
    const doc = loadPage();
    const btn = doc.querySelector('button#clear');
    expect(btn.getAttribute('title')).toBe(btn.getAttribute('aria-label'));
  });
});

describe('result display', () => {
  it('has a result display area', () => {
    const doc = loadPage();
    expect(doc.querySelector('output')).not.toBeNull();
  });

  it('has the class url-output', () => {
    const doc = loadPage();
    expect(doc.querySelector('output.url-output')).not.toBeNull();
  });

  it('has aria-live="polite" for screen reader announcements', () => {
    const doc = loadPage();
    expect(doc.querySelector('output').getAttribute('aria-live')).toBe('polite');
  });

  it('has role="status" on the output element', () => {
    const doc = loadPage();
    expect(doc.querySelector('output').getAttribute('role')).toBe('status');
  });

  it('has aria-atomic="true" on the output element', () => {
    const doc = loadPage();
    expect(doc.querySelector('output').getAttribute('aria-atomic')).toBe('true');
  });
});

describe('copy button', () => {
  it('has a copy button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#copy')).not.toBeNull();
  });

  it('has the class copy-btn', () => {
    const doc = loadPage();
    expect(doc.querySelector('button.copy-btn')).not.toBeNull();
  });

  it('contains an SVG icon', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#copy svg')).not.toBeNull();
  });

  it('has a copy-label span with text "Copy"', () => {
    const doc = loadPage();
    const label = doc.querySelector('button#copy .copy-label');
    expect(label).not.toBeNull();
    expect(label.textContent).toBe('Copy');
  });

  it('has a title attribute with text "Copy"', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#copy').getAttribute('title')).toBe('Copy');
  });
});

describe('page layout', () => {
  it('has a main element wrapping the app', () => {
    const doc = loadPage();
    expect(doc.querySelector('main')).not.toBeNull();
  });

  it('has a theme toggle button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#theme-toggle')).not.toBeNull();
  });

  it('theme toggle button contains an SVG icon', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#theme-toggle svg')).not.toBeNull();
  });

  it('dark mode is the default (no data-theme attribute on the html element)', () => {
    const doc = loadPage();
    expect(doc.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('in dark mode by default, shows the sun icon and hides the moon icon in the toggle', () => {
    const doc = loadPage();
    expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(false);
    expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(true);
  });
});

describe('open button', () => {
  it('has an open button', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#open')).not.toBeNull();
  });

  it('contains an SVG icon', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#open svg')).not.toBeNull();
  });

  it('has a title attribute with text "Open"', () => {
    const doc = loadPage();
    expect(doc.querySelector('button#open').getAttribute('title')).toBe('Open');
  });
});

describe('initApp', () => {
  it('when the paste button is clicked, reads from the clipboard and populates the input', async () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = {
      readText: vi.fn().mockResolvedValue('https://example.com/page?foo=bar'),
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    initApp(doc);

    await doc.querySelector('button#paste').click();

    expect(doc.querySelector('input.url-input').value).toBe('https://example.com/page?foo=bar');
  });

  it('when the open button is clicked, opens the stripped URL in a new tab', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    const open = vi.fn();
    doc.defaultView.open = open;
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));
    doc.querySelector('button#open').click();

    expect(open).toHaveBeenCalledWith('https://example.com/page', '_blank');
  });

  it('when switching to light mode, sets data-theme="light" on the html element', () => {
    const doc = loadPage();
    initApp(doc);
    doc.querySelector('button#theme-toggle').click();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('when switching to light mode, shows the moon icon and hides the sun icon in the toggle', () => {
    const doc = loadPage();
    initApp(doc);
    doc.querySelector('#theme-toggle').click();
    expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(false);
    expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(true);
  });

  it('when switching back to dark mode, removes data-theme from the html element', () => {
    const doc = loadPage();
    initApp(doc);
    const toggle = doc.querySelector('button#theme-toggle');
    toggle.click();
    toggle.click();
    expect(doc.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('when switching back to dark mode, shows the sun icon and hides the moon icon in the toggle', () => {
    const doc = loadPage();
    initApp(doc);
    const toggle = doc.querySelector('#theme-toggle');
    toggle.click();
    toggle.click();
    expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(false);
    expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(true);
  });


  it('when the input changes, auto-copies the stripped URL to the clipboard', () => {
    const doc = loadPage();
    const writeText = vi.fn().mockResolvedValue(undefined);
    doc.defaultView.navigator.clipboard = { writeText };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(writeText).toHaveBeenCalledWith('https://example.com/page');
  });

  it('when the input changes, displays the stripped URL in the output', () => {
    const doc = loadPage();
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar&baz=qux';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').value).toBe('https://example.com/page');
  });

  it('when the copy button is clicked, shows "Copied ✓" on the button label', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));
    doc.querySelector('button#copy').click();

    expect(doc.querySelector('button#copy .copy-label').textContent).toBe('Copied ✓');
  });

  it('copy button label reverts to "Copy" after 2 seconds', () => {
    vi.useFakeTimers();
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));
    doc.querySelector('button#copy').click();

    vi.advanceTimersByTime(2000);
    expect(doc.querySelector('button#copy .copy-label').textContent).toBe('Copy');
    vi.useRealTimers();
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

  it('when the clear button is clicked, clears the input and output', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    doc.querySelector('button#clear').click();

    expect(input.value).toBe('');
    expect(doc.querySelector('output').value).toBe('');
  });

  it('when query params are stripped, sets output data-state to "stripped"', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page?foo=bar';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').dataset.state).toBe('stripped');
  });

  it('when the URL has no params to strip, sets output data-state to "clean"', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').dataset.state).toBe('clean');
  });

  it('when the input is not a valid URL, sets output data-state to "invalid"', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'not a url';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').dataset.state).toBe('invalid');
  });

  it('when the input is not a valid URL, does not write to the clipboard', () => {
    const doc = loadPage();
    const writeText = vi.fn().mockResolvedValue(undefined);
    doc.defaultView.navigator.clipboard = { writeText };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'not a url';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(writeText).not.toHaveBeenCalled();
  });

  it('when input has a tracking hash, strips it and sets data-state to "stripped"', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page#ref=foo';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').value).toBe('https://example.com/page');
    expect(doc.querySelector('output').dataset.state).toBe('stripped');
  });

  it('when input has a plain anchor hash, keeps it in output and sets data-state to "clean"', () => {
    const doc = loadPage();
    doc.defaultView.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    initApp(doc);

    const input = doc.querySelector('input[type="url"]');
    input.value = 'https://example.com/page#section';
    input.dispatchEvent(new doc.defaultView.Event('input'));

    expect(doc.querySelector('output').value).toBe('https://example.com/page#section');
    expect(doc.querySelector('output').dataset.state).toBe('clean');
  });
});
