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
  })

  describe("saving", () => {
    it("saves in place and confirms with a status message", async () => {
      await openApp("/note")
      store.updateTitle("Groceries")

      await buttonByText("Save").trigger("click")

      expect(currentPath()).toBe("/note")
      expect(wrapper.find("[role='status']").text()).toBe("Saved")
      expect(store.notes.map((note) => note.title)).toEqual(["Groceries"])
    })

    it("offers Delete only for a note that has been saved", async () => {
      const deleteNote = () => wrapper.find(".editor__actions .btn--danger")
      await openApp("/note")
      expect(deleteNote().exists()).toBe(false)

      store.updateTitle("Groceries")
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
