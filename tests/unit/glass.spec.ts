import { describe, expect, it } from "vitest"
import { lensOffset, pinLeaving, trackGlassPointer } from "@/glass"

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

describe("lensOffset", () => {
  // A 56x66 lens with 25px corners that bends the outer 10px.
  const at = (x: number, y: number) => lensOffset(x, y, 56, 66, 25, 10)

  it("leaves the middle of the lens flat", () => {
    expect(at(28, 33)).toEqual([0, 0])
    expect(at(10, 33)).toEqual([0, 0])
  })

  it("bends hardest at the rim, pointing inward", () => {
    expect(at(0, 33)).toEqual([1, 0])
    expect(at(56, 33)).toEqual([-1, 0])
    expect(at(28, 0)).toEqual([0, 1])
    expect(at(28, 66)).toEqual([0, -1])
  })

  it("eases off across the rim band", () => {
    const [x] = at(5, 33)
    expect(x).toBeCloseTo(0.25)
  })

  it("follows the corner's curve", () => {
    // On the top-left corner arc, 45 degrees round from the top.
    const onArc = 25 - 25 * Math.SQRT1_2
    const [x, y] = at(onArc, onArc)
    expect(x).toBeCloseTo(Math.SQRT1_2)
    expect(y).toBeCloseTo(Math.SQRT1_2)
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
