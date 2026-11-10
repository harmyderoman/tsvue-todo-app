// Small helpers behind the liquid-glass look.

/**
 * Makes the specular highlight on every `.glass` surface follow the pointer
 * by exposing its position as the --mx / --my custom properties.
 */
export function trackGlassPointer(root: Document = document): void {
  root.addEventListener(
    'pointermove',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const surface = target.closest<HTMLElement>('.glass')
      if (!surface) return
      const rect = surface.getBoundingClientRect()
      surface.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      surface.style.setProperty('--my', `${event.clientY - rect.top}px`)
    },
    { passive: true }
  )
}

/**
 * How a rounded-rect lens bends what lies under the point (x, y), as a unit
 * offset: zero in the flat middle, growing to full length at the rim and
 * always pointing inward. Sampling the picture at `point + offset * strength`
 * makes edges that cross the rim curl up along it, the way thick glass does.
 */
export function lensOffset(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  band: number
): [number, number] {
  const cx = x - width / 2
  const cy = y - height / 2
  // Position relative to the corner circle's centre, folded into one quadrant.
  const qx = Math.abs(cx) - (width / 2 - radius)
  const qy = Math.abs(cy) - (height / 2 - radius)
  let depth: number
  let nx = 0
  let ny = 0
  if (qx > 0 && qy > 0) {
    const reach = Math.hypot(qx, qy)
    depth = radius - reach
    nx = (qx / reach) * Math.sign(cx)
    ny = (qy / reach) * Math.sign(cy)
  } else if (qx > qy) {
    depth = radius - qx
    nx = Math.sign(cx)
  } else {
    depth = radius - qy
    ny = Math.sign(cy)
  }
  if (depth >= band) return [0, 0]
  // Past the rim the bend stays at full strength, so the antialiased edge
  // pixels refract like the rim instead of showing a notch.
  const bend = (1 - Math.max(depth, 0) / band) ** 2
  return [-nx * bend || 0, -ny * bend || 0]
}

/**
 * Paints lensOffset() into an image for <feDisplacementMap>: x in the red
 * channel, y in green, mid-grey meaning "no shift". Returns null where there
 * is no canvas to paint on.
 */
export function lensDisplacementMap(
  width: number,
  height: number,
  radius: number,
  band: number,
  density = 2
): string | null {
  if (typeof CanvasRenderingContext2D === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * density)
  canvas.height = Math.round(height * density)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const image = ctx.createImageData(canvas.width, canvas.height)
  for (let row = 0; row < canvas.height; row++) {
    for (let col = 0; col < canvas.width; col++) {
      const [ox, oy] = lensOffset((col + 0.5) / density, (row + 0.5) / density, width, height, radius, band)
      const i = (row * canvas.width + col) * 4
      image.data[i] = 128 + Math.round(ox * 127)
      image.data[i + 1] = 128 + Math.round(oy * 127)
      image.data[i + 2] = 128
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

/**
 * <TransitionGroup @before-leave="pinLeaving">: freezes a leaving element at
 * its current box so it can go `position: absolute` and let its siblings
 * glide into the freed space.
 */
export function pinLeaving(el: Element): void {
  const node = el as HTMLElement
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node
  node.style.left = `${offsetLeft}px`
  node.style.top = `${offsetTop}px`
  node.style.width = `${offsetWidth}px`
  node.style.height = `${offsetHeight}px`
}
