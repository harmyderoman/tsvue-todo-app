import { mount } from "@vue/test-utils"
import NoteTitle from "@components/NoteTitle"

describe("NoteTitle", () => {
  test("it is vue comp", () => {
    const wrapper = mount(NoteTitle)
    expect(wrapper.text()).toContain("Click to edit Title")
  })
})
