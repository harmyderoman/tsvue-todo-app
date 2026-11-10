import { describe, expect, it } from 'vitest'
import { initialRoute } from '@/navigation'

describe('history URLs on GitHub Pages', () => {
  const base = '/tsvue-todo-app/'
  it('restores direct shared links including their payload and fragment', () => {
    const path = `${base}shared?data=abc-123_#details`
    const url = new URL(`https://example.com${base}?__route=${encodeURIComponent(path)}`)
    expect(initialRoute(url, base)).toBe(path)
  })
  it('leaves ordinary URLs alone and rejects redirects outside the app', () => {
    for (const path of [`${base}note/2`, `${base}?__route=https://evil.example/note`, `${base}?__route=/other/note`, `${base}?__route=http://[`]) {
      expect(initialRoute(new URL(`https://example.com${path}`), base)).toBeNull()
    }
  })
})
