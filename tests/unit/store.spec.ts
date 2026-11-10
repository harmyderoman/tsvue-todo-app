import { beforeEach, describe, expect, it } from "vitest"
import { nextTick } from "vue"
import { createPinia, setActivePinia } from "pinia"
import { LEGACY_STORAGE_KEY, STORAGE_KEY, useNotesStore } from "@/store"
import { freshStore, NotesStore, seedNote } from "./helpers"

/** What a page reload does: a new Pinia reading the same localStorage. */
const reload = (): NotesStore => {
  setActivePinia(createPinia())
  return useNotesStore()
}

describe("notes store", () => {
  let store: NotesStore

  beforeEach(() => {
    store = freshStore().store
  })

  describe("editing the draft", () => {
    it("updates the title", () => {
      store.updateTitle("Groceries")

      expect(store.currentNote.title).toBe("Groceries")
    })

    it("adds an empty todo", () => {
      store.addTodo()

      expect(store.currentNote.todos).toMatchObject([
        { text: "", completed: false }
      ])
    })

    it("adds the todo at the end and returns its id", () => {
      store.currentNote = {
        title: "",
        todos: [{ text: "first", completed: false }]
      }

      const id = store.addTodo()

      expect(store.currentNote.todos.map((todo) => todo.text)).toEqual([
        "first",
        ""
      ])
      expect(store.currentNote.todos[1].id).toBe(id)
    })

    it("changes only the given fields of a todo", () => {
      store.currentNote = {
        title: "",
        todos: [
          { text: "first", completed: false },
          { text: "second", completed: false }
        ]
      }

      store.updateTodo(1, { completed: true })
      store.updateTodo(0, { text: "changed" })

      expect(store.currentNote.todos).toEqual([
        { text: "changed", completed: false },
        { text: "second", completed: true }
      ])
    })

    it("removes a todo by index", () => {
      store.currentNote = {
        title: "",
        todos: [
          { text: "first", completed: false },
          { text: "second", completed: true }
        ]
      }

      store.removeTodo(0)

      expect(store.currentNote.todos).toEqual([
        { text: "second", completed: true }
      ])
    })
  })

  describe("todo ids", () => {
    it("gives every new todo its own id", () => {
      store.addTodo()
      store.addTodo()

      const [first, second] = store.currentNote.todos
      expect(first.id).toBeTypeOf("number")
      expect(second.id).not.toBe(first.id)
    })

    it("adds ids to todos saved by older versions when a note is opened", () => {
      const id = seedNote(store, "Legacy", [{ text: "Milk", completed: false }])

      store.openNote(id)

      expect(store.currentNote.todos[0].id).toBeTypeOf("number")
      expect(store.hasUnsavedChanges).toBe(false)
    })
  })

  describe("startNewNote", () => {
    it("empties the draft and takes the id after the last note", () => {
      seedNote(store, "First", [])
      store.currentNote = { title: "Leftover", todos: [] }

      store.startNewNote()

      expect(store.currentNote).toEqual({ title: "", todos: [] })
      expect(store.currentId).toBe(2)
    })
  })

  describe("saveNote", () => {
    it("adds a new note under the current id", () => {
      store.startNewNote()
      store.currentNote = {
        title: "Groceries",
        todos: [{ text: "Milk", completed: false }]
      }

      store.saveNote()

      expect(store.notes).toEqual([
        { id: 1, title: "Groceries", todos: [{ text: "Milk", completed: false }] }
      ])
    })

    it("drops todos without text, from the saved note and from the draft", () => {
      store.startNewNote()
      store.currentNote = {
        title: "Groceries",
        todos: [
          { text: "Milk", completed: false },
          { text: "", completed: false }
        ]
      }

      store.saveNote()

      expect(store.notes[0].todos).toEqual([{ text: "Milk", completed: false }])
      expect(store.currentNote.todos).toHaveLength(1)
    })

    it("updates an existing note instead of adding a duplicate", () => {
      const id = seedNote(store, "Groceries", [
        { text: "Milk", completed: false }
      ])

      store.openNote(id)
      store.updateTitle("Shopping")
      store.saveNote()

      expect(store.notes).toHaveLength(1)
      expect(store.notes[0]).toMatchObject({ id, title: "Shopping" })
    })

    it("does not change a saved note when the draft is edited after saving", () => {
      store.startNewNote()
      store.currentNote = {
        title: "Groceries",
        todos: [{ text: "Milk", completed: false }]
      }
      store.saveNote()

      store.addTodo()
      store.removeTodo(0)
      store.updateTitle("Changed")

      expect(store.notes[0]).toEqual({
        id: 1,
        title: "Groceries",
        todos: [{ text: "Milk", completed: false }]
      })
    })
  })

  describe("openNote", () => {
    it("loads a copy, so edits don't leak into the saved note", () => {
      const id = seedNote(store, "Groceries", [
        { text: "Milk", completed: false }
      ])

      expect(store.openNote(id)).toBe(true)
      store.updateTitle("Changed")
      store.addTodo()
      store.updateTodo(0, { completed: true })

      expect(store.currentId).toBe(id)
      expect(store.notes[0]).toEqual({
        id,
        title: "Groceries",
        todos: [{ text: "Milk", completed: false }]
      })
    })

    it("returns false for an unknown id and leaves the draft alone", () => {
      store.updateTitle("Draft")

      expect(store.openNote(999)).toBe(false)
      expect(store.openNote(NaN)).toBe(false)

      expect(store.currentNote.title).toBe("Draft")
    })
  })

  describe("closeNote", () => {
    it("empties the draft and forgets which note was open", () => {
      const id = seedNote(store, "Groceries", [])
      store.openNote(id)

      store.closeNote()

      expect(store.currentNote).toEqual({ title: "", todos: [] })
      expect(store.currentId).toBe(0)
      expect(store.notes).toHaveLength(1)
    })
  })

  describe("deleteNote", () => {
    it("removes only the note with the given id", () => {
      const first = seedNote(store, "First", [])
      const second = seedNote(store, "Second", [])

      store.deleteNote(first)

      expect(store.notes.map((note) => note.id)).toEqual([second])
    })
  })

  describe("idOfLastNote", () => {
    it("is 0 without notes and the last note's id otherwise", () => {
      expect(store.idOfLastNote).toBe(0)

      seedNote(store, "First", [])
      const second = seedNote(store, "Second", [])

      expect(store.idOfLastNote).toBe(second)
    })
  })

  describe("isSavedNote", () => {
    it("is true only once the note in the editor has been saved", () => {
      store.startNewNote()
      store.updateTitle("Groceries")
      expect(store.isSavedNote).toBe(false)

      store.saveNote()
      expect(store.isSavedNote).toBe(true)
    })
  })

  describe("isEmptyNote", () => {
    it("is true for a new note, and for one holding only blanks", () => {
      store.startNewNote()
      expect(store.isEmptyNote).toBe(true)

      store.updateTitle("   ")
      store.addTodo()
      expect(store.isEmptyNote).toBe(true)
    })

    it("is false once the note has a title or a todo with text", () => {
      store.startNewNote()
      store.updateTitle("Groceries")
      expect(store.isEmptyNote).toBe(false)

      store.updateTitle("")
      store.addTodo()
      store.updateTodo(0, { text: "Milk" })
      expect(store.isEmptyNote).toBe(false)
    })
  })

  describe("hasUnsavedChanges", () => {
    it("is false for an untouched new note", () => {
      store.startNewNote()

      expect(store.hasUnsavedChanges).toBe(false)
    })

    it("ignores todos without text, which Save would drop anyway", () => {
      store.startNewNote()
      store.addTodo()

      expect(store.hasUnsavedChanges).toBe(false)
    })

    it("is true after an edit and false again after saving", () => {
      const id = seedNote(store, "Groceries", [
        { text: "Milk", completed: false }
      ])
      store.openNote(id)
      expect(store.hasUnsavedChanges).toBe(false)

      store.updateTodo(0, { completed: true })
      expect(store.hasUnsavedChanges).toBe(true)

      store.saveNote()
      expect(store.hasUnsavedChanges).toBe(false)
    })
  })

  describe("undo / redo", () => {
    it("starts with nothing to undo or redo", () => {
      expect(store.canUndo).toBe(false)
      expect(store.canRedo).toBe(false)
    })

    it("undoes and redoes changes to the draft", async () => {
      store.updateTitle("One")
      await nextTick()
      store.updateTitle("Two")
      await nextTick()
      expect(store.canUndo).toBe(true)

      store.undo()
      await nextTick()
      expect(store.currentNote.title).toBe("One")
      expect(store.canRedo).toBe(true)

      store.redo()
      await nextTick()
      expect(store.currentNote.title).toBe("Two")
      expect(store.canRedo).toBe(false)
    })

    it("restores a removed todo with the same id", async () => {
      store.addTodo()
      store.updateTodo(0, { text: "Milk" })
      await nextTick()
      const { id } = store.currentNote.todos[0]

      store.removeTodo(0)
      await nextTick()
      store.undo()
      await nextTick()

      expect(store.currentNote.todos).toEqual([
        { id, text: "Milk", completed: false }
      ])
    })

    it("forgets everything on clearHistory", async () => {
      store.updateTitle("One")
      await nextTick()

      store.clearHistory()

      expect(store.canUndo).toBe(false)
      expect(store.currentNote.title).toBe("One")
    })
  })

  describe("persistence", () => {
    it("writes saved notes to localStorage", async () => {
      seedNote(store, "Groceries", [])
      await nextTick()

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
        { id: 1, title: "Groceries", todos: [] }
      ])
    })

    it("does not persist the draft being edited", async () => {
      store.startNewNote()
      store.updateTitle("Half-typed")
      await nextTick()

      expect(localStorage.getItem(STORAGE_KEY) ?? "").not.toContain("Half-typed")
      expect(reload().currentNote).toEqual({ title: "", todos: [] })
    })

    it("restores notes after a reload, and undo still works", async () => {
      seedNote(store, "Groceries", [{ text: "Milk", completed: true }])
      await nextTick()

      const reloaded = reload()
      expect(reloaded.notes).toEqual([
        { id: 1, title: "Groceries", todos: [{ text: "Milk", completed: true }] }
      ])

      reloaded.updateTitle("One")
      await nextTick()
      reloaded.updateTitle("Two")
      await nextTick()
      reloaded.undo()
      await nextTick()
      expect(reloaded.currentNote.title).toBe("One")
    })

    it("starts empty when the stored value is not a list of notes", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ broken: true }))

      expect(reload().notes).toEqual([])
    })
  })

  describe("migration from the Vuex version", () => {
    const legacyState = {
      notes: [{ id: 3, title: "Old note", todos: [{ text: "Milk", completed: true }] }],
      currentNote: { title: "Stale draft", todos: [] },
      currentId: 4
    }

    // A browser that has only ever run the Vuex version: the new key does not
    // exist yet (creating a store writes it, so drop what beforeEach created).
    beforeEach(() => localStorage.clear())

    it("carries the notes over and ignores the old draft", () => {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState))

      const migrated = reload()

      expect(migrated.notes).toEqual(legacyState.notes)
      expect(migrated.currentNote).toEqual({ title: "", todos: [] })
      expect(migrated.idOfLastNote).toBe(3)
    })

    it("leaves the old entry in place", () => {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState))

      reload()

      expect(JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)!)).toEqual(
        legacyState
      )
    })

    it("does not overwrite notes already saved by the new version", async () => {
      store = reload()
      seedNote(store, "New note", [])
      await nextTick()
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState))

      expect(reload().notes.map((note) => note.title)).toEqual(["New note"])
    })

    it("starts empty when the old entry is unreadable", () => {
      localStorage.setItem(LEGACY_STORAGE_KEY, "{not json")

      expect(reload().notes).toEqual([])
    })
  })
})
