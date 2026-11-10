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
