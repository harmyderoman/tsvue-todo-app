import { beforeEach, describe, expect, it } from "vitest"
import { nextTick } from "vue"
import store from "@/store"
import { resetStore, seedNote } from "./helpers"

describe("store", () => {
  beforeEach(resetStore)

  describe("current note", () => {
    it("updates the title", () => {
      store.commit("updateTitle", "Groceries")

      expect(store.state.currentNote.title).toBe("Groceries")
    })

    it("adds an empty todo and deletes a todo by index", () => {
      store.commit("addNewTodo")
      store.commit("addNewTodo")
      store.commit("updateTodos", [
        { text: "first", completed: false },
        { text: "second", completed: true }
      ])

      store.commit("deleteTodo", 0)

      expect(store.state.currentNote.todos).toEqual([
        { text: "second", completed: true }
      ])
    })
  })

  describe("saveNote", () => {
    it("adds a new note under the current id", () => {
      store.commit("setCurrentId", 1)
      store.commit("setCurrentNote", {
        title: "Groceries",
        todos: [{ text: "Milk", completed: false }]
      })

      store.dispatch("saveNote")

      expect(store.state.notes).toEqual([
        { id: 1, title: "Groceries", todos: [{ text: "Milk", completed: false }] }
      ])
    })

    it("drops todos without text", () => {
      store.commit("setCurrentId", 1)
      store.commit("setCurrentNote", {
        title: "Groceries",
        todos: [
          { text: "Milk", completed: false },
          { text: "", completed: false }
        ]
      })

      store.dispatch("saveNote")

      expect(store.state.notes[0].todos).toEqual([
        { text: "Milk", completed: false }
      ])
    })

    it("updates an existing note instead of adding a duplicate", () => {
      const id = seedNote("Groceries", [{ text: "Milk", completed: false }])

      store.dispatch("fetchCurrentNote", id)
      store.commit("updateTitle", "Shopping")
      store.dispatch("saveNote")

      expect(store.state.notes).toHaveLength(1)
      expect(store.state.notes[0]).toMatchObject({ id, title: "Shopping" })
    })
  })

  describe("fetchCurrentNote", () => {
    it("loads a copy, so edits don't leak into the saved note", () => {
      const id = seedNote("Groceries", [{ text: "Milk", completed: false }])

      store.dispatch("fetchCurrentNote", id)
      store.commit("updateTitle", "Changed")
      store.commit("addNewTodo")

      expect(store.state.currentId).toBe(id)
      expect(store.state.notes[0].title).toBe("Groceries")
      expect(store.state.notes[0].todos).toHaveLength(1)
    })
  })

  describe("deleteNote", () => {
    it("removes only the note with the current id", () => {
      const first = seedNote("First", [])
      const second = seedNote("Second", [])

      store.commit("setCurrentId", first)
      store.commit("deleteNote")

      expect(store.state.notes.map((note) => note.id)).toEqual([second])
    })
  })

  describe("getIdOfLastNote", () => {
    it("is 0 without notes and the last note's id otherwise", () => {
      expect(store.getters.getIdOfLastNote).toBe(0)

      seedNote("First", [])
      const second = seedNote("Second", [])

      expect(store.getters.getIdOfLastNote).toBe(second)
    })
  })

  describe("undo / redo", () => {
    it("starts with nothing to undo or redo", () => {
      expect(store.getters.canUndo).toBe(false)
      expect(store.getters.canRedo).toBe(false)
    })

    it("undoes and redoes changes to the current note", async () => {
      store.commit("updateTitle", "One")
      await nextTick()
      store.commit("updateTitle", "Two")
      await nextTick()
      expect(store.getters.canUndo).toBe(true)

      store.commit("undoChanges")
      await nextTick()
      expect(store.state.currentNote.title).toBe("One")
      expect(store.getters.canRedo).toBe(true)

      store.commit("redoChanges")
      await nextTick()
      expect(store.state.currentNote.title).toBe("Two")
      expect(store.getters.canRedo).toBe(false)
    })

    it("forgets everything on clearHistory", async () => {
      store.commit("updateTitle", "One")
      await nextTick()

      store.commit("clearHistory")

      expect(store.getters.canUndo).toBe(false)
      expect(store.state.currentNote.title).toBe("One")
    })
  })

  describe("persistence", () => {
    it("writes saved notes to localStorage", () => {
      seedNote("Groceries", [])

      const persisted = JSON.parse(localStorage.getItem("vuex") ?? "{}")

      expect(persisted.notes).toEqual([
        { id: 1, title: "Groceries", todos: [] }
      ])
    })
  })
})
