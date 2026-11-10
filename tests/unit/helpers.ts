import { nextTick } from "vue"
import store from "@/store"

/**
 * The store is a singleton persisted to localStorage, so every test starts by
 * emptying it. This goes through mutations (not replaceState) because
 * currentNote is tied to the undo/redo history ref.
 */
export async function resetStore(): Promise<void> {
  for (const note of [...store.state.notes]) {
    store.commit("setCurrentId", note.id)
    store.commit("deleteNote")
  }
  store.commit("setCurrentNote", { title: "", todos: [] })
  store.commit("setCurrentId", 0)
  // History records changes on the next tick; clear it only after that.
  await nextTick()
  store.commit("clearHistory")
  localStorage.clear()
}

/** Saves a note through the same path the UI uses and returns its id. */
export function seedNote(
  title: string,
  todos: { text: string; completed: boolean }[]
): number {
  const id = store.getters.getIdOfLastNote + 1
  store.commit("setCurrentId", id)
  store.commit("setCurrentNote", { title, todos })
  store.dispatch("saveNote")
  store.commit("setCurrentNote", { title: "", todos: [] })
  return id
}
