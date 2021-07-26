import { shallowMount } from "@vue/test-utils"
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
})
