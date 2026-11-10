import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import NoteTitle from "@/components/NoteTitle.vue"

describe("NoteTitle", () => {
  it("shows a placeholder when there is no title", () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    expect(wrapper.find("h3").text()).toBe("Click to edit Title")
    expect(wrapper.find("h3").classes()).toContain("is-placeholder")
  })

  it("shows the title it gets from props", () => {
    const wrapper = mount(NoteTitle, { props: { title: "Groceries" } })

    expect(wrapper.find("h3").text()).toBe("Groceries")
    expect(wrapper.find("h3").classes()).not.toContain("is-placeholder")
  })

  it("renders a heading and no input until clicked", () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    expect(wrapper.find("h3").exists()).toBe(true)
    expect(wrapper.find("input").exists()).toBe(false)
  })

  it("swaps the heading for a focused input holding the title on click", async () => {
    const wrapper = mount(NoteTitle, {
      props: { title: "Groceries" },
      attachTo: document.body
    })

    await wrapper.find("h3").trigger("click")
    await wrapper.vm.$nextTick()

    const input = wrapper.find("input")
    expect(wrapper.find("h3").exists()).toBe(false)
    expect(input.element.value).toBe("Groceries")
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })

  it("emits update-title while typing", async () => {
    const wrapper = mount(NoteTitle, { props: { title: "" } })

    await wrapper.find("h3").trigger("click")
    await wrapper.find("input").setValue("Test")

    expect(wrapper.emitted("update-title")).toEqual([["Test"]])
  })

  it("goes back to the heading on Enter", async () => {
    const wrapper = mount(NoteTitle, { props: { title: "Test" } })

    await wrapper.find("h3").trigger("click")
    await wrapper.find("input").trigger("keyup.enter")

    expect(wrapper.find("input").exists()).toBe(false)
    expect(wrapper.find("h3").text()).toBe("Test")
  })
})
