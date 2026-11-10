import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { flushPromises, mount, VueWrapper } from "@vue/test-utils"
import App from "@/App.vue"
import router from "@/router"
import type { Pinia } from "pinia"
import { freshStore, NotesStore, seedNote } from "./helpers"

// The editor is exercised through the whole app (real router and store), since
// its behaviour is mostly about what happens when you try to leave it.
let wrapper: VueWrapper
let pinia: Pinia
let store: NotesStore

const openApp = async (path: string) => {
  await router.push(path)
  wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [router, pinia], stubs: { teleport: true } }
  })
  await flushPromises()
}

const buttonByText = (text: string) =>
  wrapper.findAll("button").find((button) => button.text() === text)!

const currentPath = () => router.currentRoute.value.path

describe("Note editor", () => {
  beforeEach(() => {
    ;({ pinia, store } = freshStore())
  })

  afterEach(async () => {
    // Unmounting removes the unsaved-changes guard, so this always succeeds.
    wrapper.unmount()
    await router.push("/")
  })

  describe("opening", () => {
    it("loads a saved note", async () => {
      const id = seedNote(store, "Groceries", [{ text: "Milk", completed: true }])

      await openApp(`/note/${id}`)

      expect(wrapper.find("h1").text()).toBe("Groceries")
      expect(wrapper.findAll(".todo")).toHaveLength(1)
      expect(wrapper.find(".todo__text").text()).toBe("Milk")
    })

    it("starts a new note empty even if a stale draft was left behind", async () => {
      seedNote(store, "Groceries", [])
      store.currentNote = {
        title: "Leftover",
        todos: [{ text: "Old", completed: false }]
      }

      await openApp("/note")

      expect(wrapper.find("h1").text()).toBe("Click to edit Title")
      expect(wrapper.findAll(".todo")).toHaveLength(0)
      expect(store.currentId).toBe(2)
    })

    it("goes back to the list when the note does not exist", async () => {
      await openApp("/note/999")

      expect(currentPath()).toBe("/")
      expect(wrapper.find(".empty").exists()).toBe(true)
    })

    it("goes back to the list when the id is not a number", async () => {
      await openApp("/note/abc")

      expect(currentPath()).toBe("/")
    })
  })

  describe("todos", () => {
    it("adds a row and removes exactly the row whose Delete was clicked", async () => {
      const id = seedNote(store, "Groceries", [
        { text: "Milk", completed: false },
        { text: "Bread", completed: false },
        { text: "Eggs", completed: false }
      ])
      await openApp(`/note/${id}`)

      await wrapper.findAll(".todo")[1].findAll("button")[2].trigger("click")
      expect(wrapper.findAll(".todo__text").map((el) => el.text())).toEqual([
        "Milk",
        "Eggs"
      ])

      await buttonByText("+ Add todo").trigger("click")
      expect(wrapper.findAll(".todo")).toHaveLength(3)
    })

    it("opens a new row with the cursor already in it", async () => {
      await openApp("/note")

      await buttonByText("+ Add todo").trigger("click")

      expect(document.activeElement).toBe(wrapper.find(".todo__input").element)
    })

    it("saves the text on Enter and focuses a new row for continued typing", async () => {
      await openApp("/note")
      await buttonByText("+ Add todo").trigger("click")
      const input = wrapper.find<HTMLInputElement>(".todo__input")

      await input.setValue("Milk")
      await input.trigger("keydown.enter")
      await flushPromises()

      expect(store.currentNote.todos.map((todo) => todo.text)).toEqual(["Milk", ""])
      expect(document.activeElement).toBe(wrapper.find(".todo__input").element)
      expect(wrapper.find(".todo__text").text()).toBe("Milk")

      await wrapper.find(".todo__input").setValue("Bread")
      await wrapper.find(".todo__input").trigger("keydown.enter")
      await flushPromises()
      expect(store.currentNote.todos.map((todo) => todo.text)).toEqual(["Milk", "Bread", ""])
      expect(document.activeElement).toBe(wrapper.find(".todo__input").element)
    })

    it("locks Add todo while there is an empty todo", async () => {
      await openApp("/note")
      const addTodo = () => buttonByText("+ Add todo")
      expect(addTodo().attributes("disabled")).toBeUndefined()

      await addTodo().trigger("click")
      expect(addTodo().attributes("disabled")).toBeDefined()
      expect(addTodo().attributes("title")).toBe("Fill in the empty todo first")

      // A click that gets through anyway must not add a second blank row.
      await addTodo().trigger("click")
      expect(wrapper.findAll(".todo")).toHaveLength(1)

      await wrapper.find(".todo__input").setValue("Milk")
      expect(addTodo().attributes("disabled")).toBeUndefined()
      expect(addTodo().attributes("title")).toBeUndefined()
    })

    it("locks Add todo for an empty todo left closed, too", async () => {
      const id = seedNote(store, "Groceries", [{ text: "Milk", completed: false }])
      await openApp(`/note/${id}`)
      await buttonByText("+ Add todo").trigger("click")

      // Enter closes the still-empty row; it stays in the list as a blank.
      await wrapper.find(".todo__input").trigger("keydown.enter")
      await flushPromises()

      expect(wrapper.find(".todo__input").exists()).toBe(false)
      expect(buttonByText("+ Add todo").attributes("disabled")).toBeDefined()
    })
  })

  describe("keyboard undo", () => {
    const press = (target: EventTarget, init: KeyboardEventInit) =>
      target.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init })
      )

    const openEditedNote = async () => {
      const id = seedNote(store, "Groceries", [])
      await openApp(`/note/${id}`)
      store.updateTitle("Changed")
      await flushPromises()
    }

    it("undoes with Ctrl+Z and redoes with Ctrl+Shift+Z or Ctrl+Y", async () => {
      await openEditedNote()

      press(document.body, { key: "z", ctrlKey: true })
      await flushPromises()
      expect(store.currentNote.title).toBe("Groceries")

      press(document.body, { key: "Z", ctrlKey: true, shiftKey: true })
      await flushPromises()
      expect(store.currentNote.title).toBe("Changed")

      press(document.body, { key: "z", metaKey: true })
      await flushPromises()
      press(document.body, { key: "y", ctrlKey: true })
      await flushPromises()
      expect(store.currentNote.title).toBe("Changed")
    })

    it("undoes and redoes a completion change while the checkbox has focus", async () => {
      const id = seedNote(store, "Groceries", [{ text: "Milk", completed: false }])
      await openApp(`/note/${id}`)
      const checkbox = wrapper.find<HTMLInputElement>("input[type='checkbox']")
      checkbox.element.focus()
      await checkbox.setValue(true)
      await flushPromises()
      expect(store.currentNote.todos[0].completed).toBe(true)

      press(checkbox.element, { key: "z", ctrlKey: true })
      await flushPromises()
      expect(store.currentNote.todos[0].completed).toBe(false)
      expect(checkbox.element.checked).toBe(false)
      expect(document.activeElement).toBe(checkbox.element)

      press(checkbox.element, { key: "Z", ctrlKey: true, shiftKey: true })
      await flushPromises()
      expect(store.currentNote.todos[0].completed).toBe(true)
      expect(checkbox.element.checked).toBe(true)
    })

    it("leaves Ctrl+Z to the browser inside a text field", async () => {
      await openEditedNote()
      await wrapper.find("h1 button").trigger("click")

      press(wrapper.find("input.note-title").element, { key: "z", ctrlKey: true })
      await flushPromises()

      expect(store.currentNote.title).toBe("Changed")
    })

    it("does nothing while a dialog is open", async () => {
      await openEditedNote()
      await buttonByText("Back to notes").trigger("click")
      await flushPromises()
      expect(wrapper.find(".modal").exists()).toBe(true)

      press(document.body, { key: "z", ctrlKey: true })
      await flushPromises()

      expect(store.currentNote.title).toBe("Changed")
    })
  })

  describe("saving", () => {
    it("saves in place and confirms with a status message", async () => {
      await openApp("/note")
      store.updateTitle("Groceries")
      await flushPromises() // Save is disabled until the title has rendered

      await buttonByText("Save").trigger("click")

      expect(currentPath()).toBe("/note")
      expect(wrapper.find("[role='status']").text()).toBe("Saved")
      expect(store.notes.map((note) => note.title)).toEqual(["Groceries"])
    })

    it("keeps Save and Share disabled while the note is empty", async () => {
      await openApp("/note")
      expect(buttonByText("Save").attributes("disabled")).toBeDefined()
      expect(buttonByText("Share").attributes("disabled")).toBeDefined()

      store.updateTitle("Groceries")
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeUndefined()
      expect(buttonByText("Share").attributes("disabled")).toBeUndefined()

      store.updateTitle("")
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeDefined()
      expect(buttonByText("Share").attributes("disabled")).toBeDefined()
    })

    it("enables Save only while there are changes to save", async () => {
      const id = seedNote(store, "Groceries", [{ text: "Milk", completed: false }])
      await openApp(`/note/${id}`)
      expect(buttonByText("Save").attributes("disabled")).toBeDefined()

      store.updateTodo(0, { completed: true })
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeUndefined()

      await buttonByText("Save").trigger("click")
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeDefined()

      // Undoing the edit back to the saved state leaves nothing to save.
      store.updateTodo(0, { completed: false })
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeUndefined()
      store.updateTodo(0, { completed: true })
      await flushPromises()
      expect(buttonByText("Save").attributes("disabled")).toBeDefined()
    })

    it("offers Delete only for a note that has been saved", async () => {
      const deleteNote = () => wrapper.find(".editor__actions .btn--danger")
      await openApp("/note")
      expect(deleteNote().exists()).toBe(false)

      store.updateTitle("Groceries")
      await flushPromises()
      await buttonByText("Save").trigger("click")

      expect(deleteNote().exists()).toBe(true)
    })
  })

  describe("leaving", () => {
    it("leaves straight away when nothing changed", async () => {
      const id = seedNote(store, "Groceries", [])
      await openApp(`/note/${id}`)

      await buttonByText("Back to notes").trigger("click")
      await flushPromises()

      expect(currentPath()).toBe("/")
    })

    it("asks before discarding unsaved changes, and stays on Keep editing", async () => {
      const id = seedNote(store, "Groceries", [])
      await openApp(`/note/${id}`)
      store.updateTitle("Changed")

      await buttonByText("Back to notes").trigger("click")
      await flushPromises()

      expect(currentPath()).toBe(`/note/${id}`)
      expect(wrapper.find(".modal__title").text()).toBe("Leave without saving?")

      await buttonByText("Keep editing").trigger("click")
      expect(wrapper.find(".modal").exists()).toBe(false)
      expect(store.currentNote.title).toBe("Changed")
    })

    it("also guards the navigation tabs, and discards the changes on Leave", async () => {
      const id = seedNote(store, "Groceries", [])
      await openApp(`/note/${id}`)
      store.updateTitle("Changed")

      await wrapper.find(".nav__link").trigger("click")
      await flushPromises()
      expect(currentPath()).toBe(`/note/${id}`)

      await buttonByText("Leave").trigger("click")
      await flushPromises()

      expect(currentPath()).toBe("/")
      expect(store.notes[0].title).toBe("Groceries")
      expect(store.currentNote).toEqual({ title: "", todos: [] })
    })
  })

  describe("deleting", () => {
    it("deletes after confirmation and returns to the list without a second prompt", async () => {
      const id = seedNote(store, "Groceries", [{ text: "Milk", completed: false }])
      await openApp(`/note/${id}`)

      // Scoped to the note's actions: every todo row has a Delete of its own.
      await wrapper.find(".editor__actions .btn--danger").trigger("click")
      expect(wrapper.find(".modal__title").text()).toBe("Delete this note?")

      await wrapper.find(".modal .btn--danger").trigger("click")
      await flushPromises()

      expect(store.notes).toHaveLength(0)
      expect(currentPath()).toBe("/")
      expect(wrapper.find(".modal").exists()).toBe(false)
    })
  })

  describe("navigation droplet", () => {
    it("sits under the active tab and hides while editing a saved note", async () => {
      const id = seedNote(store, "Groceries", [])
      await openApp("/")
      expect(wrapper.find(".nav__drop").classes()).toContain("is-visible")

      await router.push(`/note/${id}`)
      await flushPromises()
      expect(wrapper.find(".nav__drop").classes()).not.toContain("is-visible")
    })
  })
})
