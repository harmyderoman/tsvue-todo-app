import { beforeEach, describe, expect, it, vi } from "vitest"
import { mount, RouterLinkStub } from "@vue/test-utils"
import List from "@/views/List.vue"
import { freshStore, NotesStore, seedNote } from "./helpers"
import { decodeNote } from "@/sharing"

let store: NotesStore

const push = vi.fn()

const mountList = () =>
  mount(List, {
    global: {
      stubs: { teleport: true, RouterLink: RouterLinkStub },
      mocks: { $router: { push } }
    }
  })

const buttonByText = (wrapper: ReturnType<typeof mountList>, text: string) =>
  wrapper.findAll("button").find((button) => button.text() === text)!

const deleteButton = (wrapper: ReturnType<typeof mountList>) =>
  wrapper.find('button[aria-label="Delete note"]')

describe("List", () => {
  beforeEach(() => {
    store = freshStore().store
    push.mockClear()
  })

  it("invites to create a note when there are none", () => {
    const wrapper = mountList()

    expect(wrapper.find(".empty").text()).toContain("No notes yet")
    expect(wrapper.findComponent(RouterLinkStub).props("to")).toBe("/note")
    expect(wrapper.find(".note-card").exists()).toBe(false)
  })

  it("renders a card per note with its todos and progress", () => {
    seedNote(store, "Groceries", [
      { text: "Milk", completed: true },
      { text: "Bread", completed: false }
    ])
    seedNote(store, "Trip", [])
    const wrapper = mountList()

    const cards = wrapper.findAll(".note-card")
    expect(cards).toHaveLength(2)
    expect(wrapper.find(".page-head__count").text()).toBe("2 notes")
    expect(wrapper.find(".empty").exists()).toBe(false)

    expect(cards[0].find(".note-card__title").text()).toBe("Groceries")
    expect(cards[0].findAll(".note-card__todo").map((li) => li.text())).toEqual([
      "Milk",
      "Bread"
    ])
    expect(cards[0].findAll(".note-card__todo")[0].classes()).toContain("completed")
    expect(cards[0].find(".note-card__progress").text()).toBe("1 of 2 done")

    // A note without todos has no progress meter.
    expect(cards[1].find(".note-card__progress").exists()).toBe(false)
  })

  it("labels a note without a title", () => {
    seedNote(store, "", [{ text: "Milk", completed: false }])
    const wrapper = mountList()

    expect(wrapper.find(".note-card__title").text()).toBe("Untitled note")
  })

  it("links the whole card to its note, with the title as the link text", () => {
    const id = seedNote(store, "Groceries", [])
    const wrapper = mountList()

    const link = wrapper.find(".note-card").findComponent(RouterLinkStub)
    expect(link.props("to")).toBe(`/note/${id}`)
    expect(link.text()).toBe("Groceries")
    expect(wrapper.text()).not.toContain("Open note")
  })

  it("shares the note on its card, not the one in the editor", async () => {
    seedNote(store, "Groceries", [{ text: "Milk", completed: false }])
    store.currentNote = { title: "Something else", todos: [] }
    const wrapper = mountList()

    await wrapper.find(".note-card").find('button[aria-label="Share note"]').trigger("click")

    const link = wrapper.find<HTMLInputElement>(".share-link input").element.value
    const data = new URL(link).searchParams.get("data")!
    expect(decodeNote(data)).toEqual({ title: "Groceries", todos: [{ text: "Milk", completed: false }] })
  })

  it("deletes a note only after confirmation", async () => {
    seedNote(store, "Groceries", [])
    seedNote(store, "Trip", [])
    const wrapper = mountList()

    await deleteButton(wrapper).trigger("click")
    expect(wrapper.find(".modal").exists()).toBe(true)
    expect(store.notes).toHaveLength(2)

    await buttonByText(wrapper, "Confirm").trigger("click")

    expect(wrapper.find(".modal").exists()).toBe(false)
    expect(store.notes.map((note) => note.title)).toEqual(["Trip"])
    expect(wrapper.findAll(".note-card")).toHaveLength(1)
  })

  it("keeps the note when the dialog is cancelled", async () => {
    seedNote(store, "Groceries", [])
    const wrapper = mountList()

    await deleteButton(wrapper).trigger("click")
    await buttonByText(wrapper, "Cancel").trigger("click")

    expect(wrapper.find(".modal").exists()).toBe(false)
    expect(store.notes).toHaveLength(1)
  })

  it("previews the first six todos and counts the rest", () => {
    seedNote(
      store,
      "Long",
      Array.from({ length: 9 }, (_, i) => ({
        text: `Todo ${i + 1}`,
        completed: false
      }))
    )
    const wrapper = mountList()

    expect(wrapper.findAll(".note-card__todo")).toHaveLength(6)
    expect(wrapper.find(".note-card__more").text()).toBe("+3 more")
    expect(wrapper.find(".note-card__progress").text()).toBe("0 of 9 done")
  })

  describe("view switch", () => {
    const toggle = (wrapper: ReturnType<typeof mountList>, label: string) =>
      wrapper.find(`.view-toggle__btn[aria-label="${label}"]`)

    const seedTwo = () => {
      seedNote(store, "Groceries", [
        { text: "Milk", completed: true },
        { text: "Bread", completed: false }
      ])
      seedNote(store, "", [])
    }

    it("starts on cards", () => {
      seedTwo()
      const wrapper = mountList()

      expect(wrapper.findAll(".note-card")).toHaveLength(2)
      expect(wrapper.find(".note-row").exists()).toBe(false)
      expect(toggle(wrapper, "Cards").attributes("aria-pressed")).toBe("true")
      expect(toggle(wrapper, "List").attributes("aria-pressed")).toBe("false")
    })

    it("is hidden when there are no notes", () => {
      const wrapper = mountList()

      expect(wrapper.find(".view-toggle").exists()).toBe(false)
    })

    it("switches to a list showing only titles and progress", async () => {
      seedTwo()
      const wrapper = mountList()

      await toggle(wrapper, "List").trigger("click")

      const rows = wrapper.findAll(".note-row")
      expect(rows).toHaveLength(2)
      expect(wrapper.find(".note-card").exists()).toBe(false)
      expect(toggle(wrapper, "List").attributes("aria-pressed")).toBe("true")

      expect(rows[0].find(".note-row__title").text()).toBe("Groceries")
      expect(rows[0].find(".note-row__count").text()).toBe("1 of 2 done")
      expect(rows[0].find(".meter").exists()).toBe(true)
      // No todo texts and no per-note buttons in this view.
      expect(rows[0].text()).not.toContain("Milk")
      expect(wrapper.text()).not.toContain("Delete note")

      expect(rows[1].find(".note-row__title").text()).toBe("Untitled note")
      expect(rows[1].find(".note-row__count").text()).toBe("No todos")
      expect(rows[1].find(".meter").exists()).toBe(false)
    })

    it("opens a note when its row is clicked", async () => {
      const id = seedNote(store, "Groceries", [])
      const wrapper = mountList()
      await toggle(wrapper, "List").trigger("click")

      await wrapper.find(".note-row").trigger("click")

      expect(push).toHaveBeenCalledWith(`/note/${id}`)
    })

    it("remembers the chosen view for the next visit", async () => {
      seedTwo()
      const first = mountList()
      await toggle(first, "List").trigger("click")
      await first.vm.$nextTick()
      first.unmount()

      const second = mountList()

      expect(second.findAll(".note-row")).toHaveLength(2)
    })

    it("falls back to cards when the stored view is not one it knows", () => {
      localStorage.setItem("todo-app:notes-view", "grid")
      seedTwo()

      expect(mountList().findAll(".note-card")).toHaveLength(2)
    })
  })
})
