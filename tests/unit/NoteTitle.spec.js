import { mount, shallowMount } from "@vue/test-utils"
import NoteTitle from "@/components/NoteTitle"
// import NoteTitle from "../../src/components/NoteTitle"

describe("NoteTitle", () => {
  it("it is vue comp", () => {
    const title = ""
    const wrapper = shallowMount(NoteTitle, {
      props: {
        title
      }
    })
    expect(wrapper.text()).toContain("Click to edit Title")
    // expect(true).toBe(true)
  })
})
