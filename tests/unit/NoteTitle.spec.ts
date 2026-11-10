import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import NoteTitle from "@/components/NoteTitle.vue"

describe("NoteTitle", () => {
  it("shows a placeholder when there is no title", () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    expect(wrapper.find("h1").text()).toBe("Click to edit Title")
    expect(wrapper.find("button").classes()).toContain("is-placeholder")
  })

  it("shows the title it gets from props", () => {
    const wrapper = mount(NoteTitle, { props: { title: "Groceries" } })

    expect(wrapper.find("h1").text()).toBe("Groceries")
    expect(wrapper.find("button").classes()).not.toContain("is-placeholder")
  })

  it("renders a heading and no input until activated", () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    expect(wrapper.find("h1").exists()).toBe(true)
    expect(wrapper.find("input").exists()).toBe(false)
  })

  it("is reachable by keyboard: the title is a real button", () => {
    const wrapper = mount(NoteTitle, { props: { title: "Groceries" } })

    expect(wrapper.find("h1 button").attributes("type")).toBe("button")
  })

  it("swaps the heading for a focused input holding the title", async () => {
    const wrapper = mount(NoteTitle, {
      props: { title: "Groceries" },
      attachTo: document.body
    })

    await wrapper.find("button").trigger("click")
    await wrapper.vm.$nextTick()

    const input = wrapper.find("input")
    expect(wrapper.find("h1").exists()).toBe(false)
    expect(input.element.value).toBe("Groceries")
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })

  it("emits update-title while typing", async () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    await wrapper.find("button").trigger("click")
    await wrapper.find("input").setValue("Test")

    expect(wrapper.emitted("update-title")).toEqual([["Test"]])
  })

  it("goes back to the heading on Enter and keeps focus on it", async () => {
    const wrapper = mount(NoteTitle, {
      props: { title: "Test" },
      attachTo: document.body
    })

    await wrapper.find("button").trigger("click")
    await wrapper.find("input").trigger("keydown.enter")
    await wrapper.vm.$nextTick()

    expect(wrapper.find("input").exists()).toBe(false)
    expect(wrapper.find("h1").text()).toBe("Test")
    expect(document.activeElement).toBe(wrapper.find("button").element)

    wrapper.unmount()
  })

  it("stays open on the keyup of the Enter that opened it", async () => {
    const wrapper = mount(NoteTitle, { props: { title: "Test" } })

    await wrapper.find("button").trigger("click")
    await wrapper.find("input").trigger("keyup.enter")

    expect(wrapper.find("input").exists()).toBe(true)
  })
})
