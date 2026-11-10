import { createPinia, setActivePinia } from "pinia"
import { useNotesStore } from "@/store"

export type NotesStore = ReturnType<typeof useNotesStore>

/**
 * Empties localStorage and activates a brand-new Pinia, so every test gets a
 * store with no notes and no history. Returns the Pinia too, for tests that
 * mount the whole app and need to install it.
 */
export function freshStore() {
  localStorage.clear()
  const pinia = createPinia()
  setActivePinia(pinia)
  return { pinia, store: useNotesStore() }
}

/** Saves a note through the same path the UI uses and returns its id. */
export function seedNote(
  store: NotesStore,
  title: string,
  todos: { text: string; completed: boolean }[]
): number {
  store.startNewNote()
  const id = store.currentId
  store.currentNote = { title, todos }
  store.saveNote()
  store.closeNote()
  return id
}
