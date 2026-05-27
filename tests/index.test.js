import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { JSDOM } from 'jsdom'
import { describe, it, expect } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadPage() {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
  return new JSDOM(html).window.document
}

describe('index.html', () => {
  it('contains the text "justtheurl"', () => {
    const doc = loadPage()
    expect(doc.body.textContent).toContain('justtheurl')
  })
})
