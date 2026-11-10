import { beforeEach, describe, expect, it, vi } from "vitest"
import { mount, RouterLinkStub } from "@vue/test-utils"
import List from "@/views/List.vue"
import store from "@/store"
import { resetStore, seedNote } from "./helpers"

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

describe("List", () => {
  beforeEach(async () => {
    await resetStore()
    push.mockClear()
  })

  it("invites to create a note when there are none", () => {
    const wrapper = mountList()

    expect(wrapper.find(".empty").text()).toContain("No notes yet")
    expect(wrapper.findComponent(RouterLinkStub).props("to")).toBe("/note")
    expect(wrapper.find(".note-card").exists()).toBe(false)
  })

  it("renders a card per note with its todos and progress", () => {
    seedNote("Groceries", [
      { text: "Milk", completed: true },
      { text: "Bread", completed: false }
    ])
    seedNote("Trip", [])
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
    seedNote("", [{ text: "Milk", completed: false }])
    const wrapper = mountList()

    expect(wrapper.find(".note-card__title").text()).toBe("Untitled note")
  })

  it("opens a note", async () => {
    const id = seedNote("Groceries", [])
    const wrapper = mountList()

    await buttonByText(wrapper, "Open note").trigger("click")

    expect(push).toHaveBeenCalledWith(`/note/${id}`)
  })

  it("deletes a note only after confirmation", async () => {
    seedNote("Groceries", [])
    seedNote("Trip", [])
    const wrapper = mountList()

    await buttonByText(wrapper, "Delete note").trigger("click")
    expect(wrapper.find(".modal").exists()).toBe(true)
    expect(store.state.notes).toHaveLength(2)

    await buttonByText(wrapper, "Confirm").trigger("click")

    expect(wrapper.find(".modal").exists()).toBe(false)
    expect(store.state.notes.map((note) => note.title)).toEqual(["Trip"])
    expect(wrapper.findAll(".note-card")).toHaveLength(1)
  })

  it("keeps the note when the dialog is cancelled", async () => {
    seedNote("Groceries", [])
    const wrapper = mountList()

    await buttonByText(wrapper, "Delete note").trigger("click")
    await buttonByText(wrapper, "Cancel").trigger("click")

    expect(wrapper.find(".modal").exists()).toBe(false)
    expect(store.state.notes).toHaveLength(1)
  })
})
