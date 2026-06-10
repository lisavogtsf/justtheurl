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

function makeClipboard() {
  return { writeText: vi.fn().mockResolvedValue(undefined) };
}

function setupDoc() {
  const doc = loadPage();
  doc.defaultView.navigator.clipboard = makeClipboard();
  initApp(doc);
  return doc;
}

function typeUrl(doc, url) {
  const input = doc.querySelector('input[type="url"]');
  input.value = url;
  input.dispatchEvent(new doc.defaultView.Event('input'));
  return input;
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

  it('has a .url-status element below the output', () => {
    const doc = loadPage();
    expect(doc.querySelector('p.url-status')).not.toBeNull();
  });

  it('has a for attribute linking it to the url input', () => {
    const doc = loadPage();
    expect(doc.querySelector('output').getAttribute('for')).toBe('url-input');
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

  it('has a favicon link in the head', () => {
    const doc = loadPage();
    expect(doc.querySelector('link[rel="icon"]')).not.toBeNull();
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
  describe('paste button', () => {
    it('hides the paste button when navigator.clipboard is unavailable', () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = undefined;
      initApp(doc);
      expect(doc.querySelector('button#paste').hidden).toBe(true);
    });

    it('when clicked, reads from the clipboard and populates the input', async () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = {
        readText: vi.fn().mockResolvedValue('https://example.com/page?foo=bar'),
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      initApp(doc);

      await doc.querySelector('button#paste').click();

      expect(doc.querySelector('input.url-input').value).toBe('https://example.com/page?foo=bar');
    });

    it('when clipboard read is denied, shows "clipboard access denied" in .url-status', async () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = {
        readText: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      initApp(doc);

      await doc.querySelector('button#paste').click();

      expect(doc.querySelector('.url-status').textContent).toBe('clipboard access denied');
    });
  });

  describe('open button', () => {
    it('when clicked, opens the stripped URL in a new tab', () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = makeClipboard();
      const open = vi.fn();
      doc.defaultView.open = open;
      initApp(doc);

      typeUrl(doc, 'https://example.com/page?foo=bar');
      doc.querySelector('button#open').click();

      expect(open).toHaveBeenCalledWith('https://example.com/page', '_blank');
    });
  });

  describe('theme toggle', () => {
    it('when switching to light mode, sets data-theme="light" on the html element', () => {
      const doc = setupDoc();
      doc.querySelector('button#theme-toggle').click();
      expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('when switching to light mode, shows the moon icon and hides the sun icon', () => {
      const doc = setupDoc();
      doc.querySelector('#theme-toggle').click();
      expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(false);
      expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(true);
    });

    it('when switching back to dark mode, removes data-theme from the html element', () => {
      const doc = setupDoc();
      const toggle = doc.querySelector('button#theme-toggle');
      toggle.click();
      toggle.click();
      expect(doc.documentElement.getAttribute('data-theme')).toBeNull();
    });

    it('when switching back to dark mode, shows the sun icon and hides the moon icon', () => {
      const doc = setupDoc();
      const toggle = doc.querySelector('#theme-toggle');
      toggle.click();
      toggle.click();
      expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(false);
      expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(true);
    });

    it('sets data-theme="light" on init when prefers-color-scheme is light', () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = makeClipboard();
      doc.defaultView.matchMedia = (query) => ({
        matches: query === '(prefers-color-scheme: light)',
      });
      initApp(doc);
      expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('shows moon icon and hides sun icon on init when prefers-color-scheme is light', () => {
      const doc = loadPage();
      doc.defaultView.navigator.clipboard = makeClipboard();
      doc.defaultView.matchMedia = (query) => ({
        matches: query === '(prefers-color-scheme: light)',
      });
      initApp(doc);
      expect(doc.querySelector('#theme-toggle .icon-moon').hasAttribute('hidden')).toBe(false);
      expect(doc.querySelector('#theme-toggle .icon-sun').hasAttribute('hidden')).toBe(true);
    });
  });

  describe('input and output', () => {
    it('displays the stripped URL in the output', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar&baz=qux');
      expect(doc.querySelector('output').value).toBe('https://example.com/page');
    });

    it('sets output data-state to "stripped" when params are stripped', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar');
      expect(doc.querySelector('output').dataset.state).toBe('stripped');
    });

    it('sets output data-state to "clean" when the URL has no params', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page');
      expect(doc.querySelector('output').dataset.state).toBe('clean');
    });

    it('sets output data-state to "invalid" when the input is not a valid URL', () => {
      const doc = setupDoc();
      typeUrl(doc, 'not a url');
      expect(doc.querySelector('output').dataset.state).toBe('invalid');
    });

    it('strips a tracking hash and sets data-state to "stripped"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page#ref=foo');
      expect(doc.querySelector('output').value).toBe('https://example.com/page');
      expect(doc.querySelector('output').dataset.state).toBe('stripped');
    });

    it('keeps a plain anchor hash in the output and sets data-state to "clean"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page#section');
      expect(doc.querySelector('output').value).toBe('https://example.com/page#section');
      expect(doc.querySelector('output').dataset.state).toBe('clean');
    });

    it('auto-copies the stripped URL to the clipboard when the input changes', () => {
      const doc = loadPage();
      const writeText = vi.fn().mockResolvedValue(undefined);
      doc.defaultView.navigator.clipboard = { writeText };
      initApp(doc);

      typeUrl(doc, 'https://example.com/page?foo=bar');

      expect(writeText).toHaveBeenCalledWith('https://example.com/page');
    });

    it('does not write to the clipboard when the input is not a valid URL', () => {
      const doc = loadPage();
      const writeText = vi.fn().mockResolvedValue(undefined);
      doc.defaultView.navigator.clipboard = { writeText };
      initApp(doc);

      typeUrl(doc, 'not a url');

      expect(writeText).not.toHaveBeenCalled();
    });

    it('does not write to the clipboard again when the same URL is typed a second time', () => {
      const doc = loadPage();
      const writeText = vi.fn().mockResolvedValue(undefined);
      doc.defaultView.navigator.clipboard = { writeText };
      initApp(doc);

      typeUrl(doc, 'https://example.com/page?foo=bar');
      typeUrl(doc, 'https://example.com/page?foo=bar');

      expect(writeText).toHaveBeenCalledTimes(1);
    });
  });

  describe('copy button', () => {
    it('shows "Copied ✓" on the button label when clicked', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar');
      doc.querySelector('button#copy').click();
      expect(doc.querySelector('button#copy .copy-label').textContent).toBe('Copied ✓');
    });

    it('reverts the label to "Copy" after 2 seconds', () => {
      vi.useFakeTimers();
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar');
      doc.querySelector('button#copy').click();
      vi.advanceTimersByTime(2000);
      expect(doc.querySelector('button#copy .copy-label').textContent).toBe('Copy');
      vi.useRealTimers();
    });

    it('copies the stripped URL to the clipboard when clicked', () => {
      const doc = loadPage();
      const writeText = vi.fn().mockResolvedValue(undefined);
      doc.defaultView.navigator.clipboard = { writeText };
      initApp(doc);

      typeUrl(doc, 'https://example.com/page?foo=bar');
      doc.querySelector('button#copy').click();

      expect(writeText).toHaveBeenCalledWith('https://example.com/page');
    });
  });

  describe('clear and escape', () => {
    it('when Escape is pressed, clears the input value', () => {
      const doc = setupDoc();
      const input = typeUrl(doc, 'https://example.com/page?foo=bar');
      input.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(input.value).toBe('');
    });

    it('when Escape is pressed, clears the output value', () => {
      const doc = setupDoc();
      const input = typeUrl(doc, 'https://example.com/page?foo=bar');
      input.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(doc.querySelector('output').value).toBe('');
    });

    it('after pressing Escape, focus returns to the input', () => {
      const doc = setupDoc();
      const input = doc.querySelector('input[type="url"]');
      input.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(doc.activeElement).toBe(input);
    });

    it('when the clear button is clicked, clears the input and output', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar');
      doc.querySelector('button#clear').click();
      expect(doc.querySelector('input[type="url"]').value).toBe('');
      expect(doc.querySelector('output').value).toBe('');
    });

    it('after clicking clear, focus returns to the input', () => {
      const doc = setupDoc();
      doc.querySelector('button#clear').click();
      expect(doc.activeElement).toBe(doc.querySelector('input[type="url"]'));
    });

    it('after clicking clear, .url-status is empty', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page');
      doc.querySelector('button#clear').click();
      expect(doc.querySelector('.url-status').textContent).toBe('');
    });

    it('after pressing Escape, .url-status is empty', () => {
      const doc = setupDoc();
      const input = typeUrl(doc, 'https://example.com/page');
      input.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(doc.querySelector('.url-status').textContent).toBe('');
    });
  });

  describe('status messages', () => {
    it('for empty input, .url-status is empty', () => {
      const doc = setupDoc();
      typeUrl(doc, '');
      expect(doc.querySelector('.url-status').textContent).toBe('');
    });

    it('for invalid input, .url-status has data-state="invalid"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'not a url');
      expect(doc.querySelector('.url-status').dataset.state).toBe('invalid');
    });

    it('for invalid input, .url-status text is "not a valid URL"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'not a url');
      expect(doc.querySelector('.url-status').textContent).toBe('not a valid URL');
    });

    it('for a clean URL, .url-status text is "already clean"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page');
      expect(doc.querySelector('.url-status').textContent).toBe('already clean');
    });

    it('after stripping 1 param, .url-status text is "1 param removed"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar');
      expect(doc.querySelector('.url-status').textContent).toBe('1 param removed');
    });

    it('after stripping 2 params, .url-status text is "2 params removed"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page?foo=bar&baz=qux');
      expect(doc.querySelector('.url-status').textContent).toBe('2 params removed');
    });

    it('after stripping a tracking hash, .url-status text is "1 param removed"', () => {
      const doc = setupDoc();
      typeUrl(doc, 'https://example.com/page#ref=foo');
      expect(doc.querySelector('.url-status').textContent).toBe('1 param removed');
    });
  });
});
describe('footer', () => {
  it('has a footer element', () => {
    const doc = loadPage();
    expect(doc.querySelector('footer')).not.toBeNull();
  });

  it('has a link to activistchecklist.org/links/', () => {
    const doc = loadPage();
    expect(doc.querySelector('footer a[href="https://activistchecklist.org/links/"]')).not.toBeNull();
  });

  it('has a link to github.com/lisavogtsf/', () => {
    const doc = loadPage();
    expect(doc.querySelector('footer a[href="https://github.com/lisavogtsf/"]')).not.toBeNull();
  });

  it('has a link to the justtheurl source code repo', () => {
    const doc = loadPage();
    expect(doc.querySelector('footer a[href="https://github.com/lisavogtsf/justtheurl"]')).not.toBeNull();
  });

  it('contains the privacy text', () => {
    const doc = loadPage();
    expect(doc.querySelector('footer').textContent).toContain('Your URLs never leave your browser.');
  });
});
