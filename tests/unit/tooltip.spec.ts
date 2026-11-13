import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { installGlassTooltips } from "@/tooltip"

const pointer = (type: string, target: Element, init: MouseEventInit = {}) =>
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }))

describe("glass tooltips", () => {
  let uninstall: () => void
  const bubble = () => document.querySelector<HTMLElement>(".glass-tip")!

  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = `
      <button id="share" aria-label="Share note" data-tip="Add a title first"><svg><path id="icon" /></svg></button>
      <button id="plain">Plain</button>`
    uninstall = installGlassTooltips()
  })

  afterEach(() => {
    uninstall()
    vi.useRealTimers()
  })

  it("shows the element's tip after a short rest, and describes the element with it", () => {
    const share = document.getElementById("share")!
    pointer("pointerover", document.getElementById("icon")!)
    expect(bubble().classList).not.toContain("is-visible")

    vi.advanceTimersByTime(400)

    expect(bubble().classList).toContain("is-visible")
    expect(bubble().textContent).toBe("Add a title first")
    expect(bubble().getAttribute("role")).toBe("tooltip")
    expect(share.getAttribute("aria-describedby")).toBe(bubble().id)
  })

  it("hides when the pointer moves on to something without a tip, or presses", () => {
    pointer("pointerover", document.getElementById("share")!)
    vi.advanceTimersByTime(400)

    pointer("pointerover", document.getElementById("plain")!)
    expect(bubble().classList).not.toContain("is-visible")
    expect(document.getElementById("share")!.hasAttribute("aria-describedby")).toBe(false)

    pointer("pointerover", document.getElementById("share")!)
    vi.advanceTimersByTime(400)
    pointer("pointerdown", document.getElementById("share")!)
    expect(bubble().classList).not.toContain("is-visible")
  })

  it("never shows for a quick pass over the element", () => {
    pointer("pointerover", document.getElementById("share")!)
    vi.advanceTimersByTime(100)
    pointer("pointerover", document.getElementById("plain")!)
    vi.advanceTimersByTime(1000)

    expect(bubble().classList).not.toContain("is-visible")
  })

  it("removes the bubble when uninstalled", () => {
    uninstall()
    expect(document.querySelector(".glass-tip")).toBeNull()
    uninstall = () => {}
  })
})
