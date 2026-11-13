// Glass tooltips: one shared bubble that shows the `data-tip` text of whatever
// the pointer rests on or the keyboard focuses. It stands in for the native
// `title` tooltip, which can't be styled.

const SHOW_DELAY = 350
/** Room between the bubble and its element, taken up by the little tail clouds. */
const GAP = 14
/** Closest the bubble may come to the edge of the window. */
const EDGE = 8

/**
 * Adds the bubble to the page and starts following the pointer and focus.
 * Returns a function that removes it again.
 */
export function installGlassTooltips(doc: Document = document): () => void {
  const win = doc.defaultView ?? window
  const tip = doc.createElement('div')
  tip.className = 'glass-tip'
  tip.id = 'glass-tip'
  tip.setAttribute('role', 'tooltip')
  doc.body.appendChild(tip)

  let anchor: HTMLElement | null = null
  let pending: HTMLElement | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const tipOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>('[data-tip]') : null

  function show(el: HTMLElement) {
    pending = null
    const text = el.dataset.tip
    if (!text || !el.isConnected) return
    anchor = el
    tip.textContent = text
    // Measured with the text in place; the bubble keeps its layout while
    // hidden. offset* rather than the bounding box, which would report the
    // bubble shrunk by its entrance animation.
    const a = el.getBoundingClientRect()
    const t = { width: tip.offsetWidth, height: tip.offsetHeight }
    const below = a.top - t.height - GAP < EDGE
    const centre = a.left + a.width / 2
    const left = Math.min(Math.max(centre - t.width / 2, EDGE), win.innerWidth - t.width - EDGE)
    tip.style.left = `${left}px`
    tip.style.top = `${below ? a.bottom + GAP : a.top - t.height - GAP}px`
    tip.style.setProperty('--tail-x', `${centre - left}px`)
    tip.dataset.side = below ? 'below' : 'above'
    // Screen readers already hear the label; only a different text is news.
    if (el.getAttribute('aria-label') !== text) el.setAttribute('aria-describedby', tip.id)
    tip.classList.add('is-visible')
  }

  function hide() {
    clearTimeout(timer)
    pending = null
    if (anchor?.getAttribute('aria-describedby') === tip.id) anchor.removeAttribute('aria-describedby')
    anchor = null
    tip.classList.remove('is-visible')
  }

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const el = tipOf(event.target)
    if (el && el === (anchor ?? pending)) return
    hide()
    if (!el) return
    pending = el
    timer = setTimeout(() => show(el), SHOW_DELAY)
  }
  const onPointerOut = (event: PointerEvent) => {
    if (!event.relatedTarget) hide() // left the window
  }
  const onFocusIn = (event: FocusEvent) => {
    const el = tipOf(event.target)
    if (!el) return
    let byKeyboard = false
    try {
      byKeyboard = el.matches(':focus-visible')
    } catch {
      // A browser without :focus-visible gets tooltips on hover only.
    }
    if (byKeyboard) {
      hide()
      show(el)
    }
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') hide()
  }

  const listeners: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [
    [doc, 'pointerover', onPointerOver as EventListener],
    [doc, 'pointerout', onPointerOut as EventListener],
    [doc, 'pointerdown', hide],
    [doc, 'focusin', onFocusIn as EventListener],
    [doc, 'focusout', hide],
    [doc, 'keydown', onKeyDown as EventListener],
    [win, 'scroll', hide, { capture: true, passive: true }],
    [win, 'resize', hide]
  ]
  for (const [target, type, listener, options] of listeners) target.addEventListener(type, listener, options)

  return () => {
    hide()
    for (const [target, type, listener, options] of listeners) target.removeEventListener(type, listener, options)
    tip.remove()
  }
}
