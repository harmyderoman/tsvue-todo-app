import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import ModalWindow from "@/components/ModalWindow.vue"

const mountModal = (show: boolean, attachTo?: HTMLElement) =>
  mount(ModalWindow, {
    attachTo,
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

  it("names the dialog after its title", () => {
    const wrapper = mountModal(true)
    const dialog = wrapper.find("[role='dialog']")

    expect(dialog.attributes("aria-modal")).toBe("true")
    expect(dialog.attributes("aria-labelledby")).toBe(
      wrapper.find(".modal__title").attributes("id")
    )
  })

  it("moves focus into the dialog on open and back to the opener on close", async () => {
    document.body.innerHTML = "<button id='opener'>Open</button><div id='host'></div>"
    const opener = document.getElementById("opener")!
    opener.focus()
    const wrapper = mountModal(false, document.getElementById("host")!)

    await wrapper.setProps({ show: true })
    expect(document.activeElement).toBe(wrapper.find("[role='dialog']").element)

    await wrapper.setProps({ show: false })
    expect(document.activeElement).toBe(opener)

    wrapper.unmount()
  })

  it("keeps Tab inside the dialog", async () => {
    document.body.innerHTML = "<div id='host'></div>"
    const wrapper = mountModal(true, document.getElementById("host")!)
    const close = wrapper.find<HTMLElement>(".modal__close")
    const confirm = wrapper.find<HTMLElement>(".confirm")

    // Tab on the last control wraps to the first...
    confirm.element.focus()
    await confirm.trigger("keydown", { key: "Tab" })
    expect(document.activeElement).toBe(close.element)

    // ...and Shift+Tab on the first wraps to the last.
    await close.trigger("keydown", { key: "Tab", shiftKey: true })
    expect(document.activeElement).toBe(confirm.element)

    wrapper.unmount()
  })
})
