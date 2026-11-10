import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import ModalWindow from "@/components/ModalWindow.vue"

const mountModal = (show: boolean) =>
  mount(ModalWindow, {
    props: { show },
    slots: {
      "modal-header": "Delete this note?",
      "modal-body": "It will be gone for good.",
      "modal-actions": "<button class='confirm'>Confirm</button>"
    },
    global: { stubs: { teleport: true } }
  })

describe("ModalWindow", () => {
  it("renders nothing while hidden", () => {
    const wrapper = mountModal(false)

    expect(wrapper.find(".modal").exists()).toBe(false)
  })

  it("is visible straight away when mounted with show=true", () => {
    const wrapper = mountModal(true)

    expect(wrapper.find("[role='dialog']").exists()).toBe(true)
  })

  it("renders its slots", () => {
    const wrapper = mountModal(true)

    expect(wrapper.find(".modal__title").text()).toBe("Delete this note?")
    expect(wrapper.find(".modal__body").text()).toBe("It will be gone for good.")
    expect(wrapper.find(".confirm").exists()).toBe(true)
  })

  it("appears and disappears when show changes", async () => {
    const wrapper = mountModal(false)

    await wrapper.setProps({ show: true })
    expect(wrapper.find(".modal").exists()).toBe(true)

    await wrapper.setProps({ show: false })
    expect(wrapper.find(".modal").exists()).toBe(false)
  })

  it("emits onClose from the close button", async () => {
    const wrapper = mountModal(true)

    await wrapper.find(".modal__close").trigger("click")

    expect(wrapper.emitted("onClose")).toHaveLength(1)
  })

  it("emits onClose on a backdrop click but not on a click inside the dialog", async () => {
    const wrapper = mountModal(true)

    await wrapper.find(".modal__dialog").trigger("click")
    expect(wrapper.emitted("onClose")).toBeUndefined()

    await wrapper.find(".modal").trigger("click")
    expect(wrapper.emitted("onClose")).toHaveLength(1)
  })

  it("emits onClose on Escape only while open", async () => {
    const wrapper = mountModal(false)
    const pressEscape = () =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))

    pressEscape()
    expect(wrapper.emitted("onClose")).toBeUndefined()

    await wrapper.setProps({ show: true })
    pressEscape()
    expect(wrapper.emitted("onClose")).toHaveLength(1)

    wrapper.unmount()
  })
})
