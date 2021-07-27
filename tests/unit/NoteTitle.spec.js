import { shallowMount, mount } from "@vue/test-utils"
import NoteTitle from "@/components/NoteTitle"

describe("NoteTitle", () => {
  it("it shows 'Click to edit Title' when it's no title", () => {
    const title = ""
    const wrapper = shallowMount(NoteTitle, {
      props: {
        title
      }
    })
    expect(wrapper.text()).toContain("Click to edit Title")
  })
  it("it shows title that it get from the props", () => {
    const title = "Test"
    const wrapper = shallowMount(NoteTitle, {
      props: {
        title
      }
    })
    expect(wrapper.text()).toContain("Test")
  })
  it("contain h3 and don't contain input, when mounted", () => {
    const title = ""
    const wrapper = mount(NoteTitle, {
      props: {
        title
      }
    })
    const h3 = wrapper.find("h3")
    expect(h3.isVisible()).toBe(true)
  })
  it("contain input when clicked", async () => {
    const title = ""
    const wrapper = mount(NoteTitle, {
      props: {
        title
      }
    })
    const h3 = wrapper.find("h3")

    await h3.trigger("click")

    expect(wrapper.find("input").isVisible()).toBe(true)
  })
  it("emits event on text input and after enter keydown triggered it hide input and show title", async () => {
    const text = "Test"
    const title = ""
    const wrapper = mount(NoteTitle, {
      props: {
        title
      }
    })
    const h3 = wrapper.find("h3")

    await h3.trigger("click")
    const input = wrapper.find('input[type="text"]')
    expect(input.isVisible()).toBe(true)
    input.setValue(text)
    expect(wrapper.emitted("update-title")).toBeTruthy()
    expect(wrapper.emitted("update-title")[0]).toEqual([text])

    await input.trigger("keydown.enter")
    expect(h3.isVisible()).toBe(true)
  })
})
