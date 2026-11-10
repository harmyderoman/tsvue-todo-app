import { describe, expect, it } from "vitest"
import { pinLeaving, trackGlassPointer } from "@/glass"

const movePointer = (target: Element, clientX: number, clientY: number) =>
  target.dispatchEvent(
    new MouseEvent("pointermove", { bubbles: true, clientX, clientY })
  )

describe("trackGlassPointer", () => {
  it("writes the pointer position, relative to the surface, onto the nearest .glass", () => {
    document.body.innerHTML = `<div class="glass"><span id="inner"></span></div>`
    const surface = document.querySelector<HTMLElement>(".glass")!
    surface.getBoundingClientRect = () => ({ left: 100, top: 40 }) as DOMRect
    trackGlassPointer()

    movePointer(document.getElementById("inner")!, 130, 65)

    expect(surface.style.getPropertyValue("--mx")).toBe("30px")
    expect(surface.style.getPropertyValue("--my")).toBe("25px")
  })

  it("ignores movement outside glass surfaces", () => {
    document.body.innerHTML = `<p id="plain"></p>`
    trackGlassPointer()
    const plain = document.getElementById("plain")!

    movePointer(plain, 5, 5)

    expect(plain.style.getPropertyValue("--mx")).toBe("")
  })
})

describe("pinLeaving", () => {
  it("freezes the element at its current box", () => {
    const el = document.createElement("div")
    Object.defineProperties(el, {
      offsetLeft: { value: 12 },
      offsetTop: { value: 34 },
      offsetWidth: { value: 200 },
      offsetHeight: { value: 80 }
    })

    pinLeaving(el)

    expect(el.style.left).toBe("12px")
    expect(el.style.top).toBe("34px")
    expect(el.style.width).toBe("200px")
    expect(el.style.height).toBe("80px")
  })
})
