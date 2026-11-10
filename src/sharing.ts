import type { Draft } from '@/store'

// Only content travels in the link; local ids belong to the recipient.
export function encodeNote(note: Draft): string {
  const content = JSON.stringify({ v: 1, title: note.title,
    todos: note.todos.map(({ text, completed }) => ({ text, completed })) })
  return btoa(Array.from(new TextEncoder().encode(content), byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeNote(payload: string): Draft | null {
  try {
    const bytes = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0))
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    if (value?.v !== 1 || typeof value.title !== 'string' || !Array.isArray(value.todos)) return null
    if (!value.todos.every((todo: unknown) => todo !== null && typeof todo === 'object'
      && 'text' in todo && typeof todo.text === 'string'
      && 'completed' in todo && typeof todo.completed === 'boolean')) return null
    return { title: value.title, todos: value.todos.map((todo: { text: string; completed: boolean }) =>
      ({ text: todo.text, completed: todo.completed })) }
  } catch {
    return null
  }
}

export function sharedUrl(note: Draft): string {
  const url = new URL(`${import.meta.env.BASE_URL}shared`, window.location.origin)
  url.searchParams.set('data', encodeNote(note))
  return url.href
}
