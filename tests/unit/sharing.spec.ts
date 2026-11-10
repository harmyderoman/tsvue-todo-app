import { describe, expect, it, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Shared from '@/views/Shared.vue'
import { decodeNote, encodeNote, sharedUrl } from '@/sharing'
import { freshStore } from './helpers'

const note = { title: 'Покупки 🛒', todos: [{ text: 'חלב & хлеб #1', completed: false }] }

describe('shared notes', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('round trips Unicode and completion without local ids', () => {
    const encoded = encodeNote({ ...note, todos: [{ ...note.todos[0], id: 99 }] })
    expect(decodeNote(encoded)).toEqual(note)
    expect(encoded).not.toMatch(/[+/=]/)
    const url = new URL(sharedUrl(note))
    expect(decodeNote(new URLSearchParams(url.hash.split('?')[1]).get('data')!)).toEqual(note)
  })

  it('rejects malformed and incorrectly shaped payloads', () => {
    for (const value of ['!', '', btoa('{}'), btoa('{"v":1,"title":"x","todos":[{"text":"x","completed":"false"}]}')]) {
      expect(decodeNote(value)).toBeNull()
    }
  })

  async function open(data: string) {
    const { pinia, store } = freshStore()
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/shared', component: Shared },
      { path: '/note/:id', component: { template: '<div>Editor</div>' } }
    ] })
    await router.push({ path: '/shared', query: { data } })
    const wrapper = mount(Shared, { global: { plugins: [pinia, router] } })
    return { wrapper, store, router }
  }

  it('only stores a local copy when editing, preserving the requested toggle', async () => {
    const { wrapper, store, router } = await open(encodeNote(note))
    expect(wrapper.text()).toContain(note.title)
    expect(store.notes).toEqual([])
    await wrapper.find('input').setValue(true)
    await flushPromises()
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].title).toBe(note.title)
    expect(store.notes[0].todos[0].completed).toBe(true)
    expect(router.currentRoute.value.path).toBe(`/note/${store.notes[0].id}`)
    wrapper.unmount()
  })

  it('shows an error without saving data for a broken link', async () => {
    const { wrapper, store } = await open('broken')
    expect(wrapper.text()).toContain('Invalid shared link')
    expect(store.notes).toEqual([])
    wrapper.unmount()
  })
})
