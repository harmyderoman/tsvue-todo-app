<template>
  <router-link class="logo" to="/" aria-label="Todo App, home" title="Todo App" @pointerdown="disturb" @keydown.enter="disturb">
    <span class="logo__mark" aria-hidden="true">
      <!-- The body: a see-through pane cut to the tick, so the page shows
           through it, blurred and brightened like thick glass. -->
      <span class="logo__glass" :style="{ clipPath: `url(#${cutId})` }" />

      <!-- The light: nothing is drawn on the face. A shadow falls outside the
           shape, and the edges catch light on the inside of the rim. -->
      <svg class="logo__light" viewBox="0 0 32 32">
        <defs>
          <!-- Maps the 32-unit grid onto the glass pane, which is MARGIN
               units larger on every side to leave the waves room. -->
          <clipPath :id="cutId" clipPathUnits="objectBoundingBox">
            <path :d="shape" :transform="`translate(${MARGIN / PANE} ${MARGIN / PANE}) scale(${1 / PANE})`" />
          </clipPath>
          <clipPath :id="insideId"><path ref="outline" :d="shape" /></clipPath>
          <mask :id="outsideId" maskUnits="userSpaceOnUse" :x="-MARGIN" :y="-MARGIN" :width="PANE" :height="PANE">
            <rect :x="-MARGIN" :y="-MARGIN" :width="PANE" :height="PANE" fill="#fff" />
            <path :d="shape" />
          </mask>
          <!-- Bright where light enters (top left) and where it leaves
               (bottom right), faint in between: the app's --glass-rim. -->
          <linearGradient :id="rimId" gradientUnits="userSpaceOnUse" x1="5" y1="3" x2="27" y2="29">
            <stop offset="0" stop-color="#fff" />
            <stop offset=".42" stop-color="#fff" stop-opacity=".22" />
            <stop offset=".64" stop-color="#fff" stop-opacity=".16" />
            <stop offset="1" stop-color="#fff" stop-opacity=".85" />
          </linearGradient>
          <filter :id="softId" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation=".55" />
          </filter>
          <filter :id="shadowId" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>
        </defs>
        <g :mask="`url(#${outsideId})`">
          <path class="logo__shadow" :d="shape" transform="translate(0 2.6)" :filter="`url(#${shadowId})`" />
        </g>
        <g :clip-path="`url(#${insideId})`" fill="none">
          <path class="logo__depth" :d="shape" stroke-width="7" transform="translate(1.2 1.8)" :filter="`url(#${shadowId})`" />
          <path :d="shape" :stroke="`url(#${rimId})`" stroke-width="3" :filter="`url(#${softId})`" />
          <path :d="shape" :stroke="`url(#${rimId})`" stroke-width=".7" />
        </g>
      </svg>
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'

// Outline of the favicon's tick on a 32-unit grid: a 9-unit round stroke
// through (5.5, 16.5) -> (13, 24.5) -> (25.5, 5.5), with the inner corner eased.
const TICK =
  'M2.22 19.58 9.72 27.58A4.5 4.5 0 0 0 16.76 26.97L29.26 7.97A4.5 4.5 0 0 0 21.74 3.03' +
  'L13.26 15.92Q12.38 17.26 11.28 16.09L8.78 13.42A4.5 4.5 0 0 0 2.22 19.58Z'
const MARGIN = 8
const PANE = 32 + MARGIN * 2

const cutId = useId()
const insideId = useId()
const outsideId = useId()
const rimId = useId()
const softId = useId()
const shadowId = useId()
const outline = ref<SVGPathElement | null>(null)
const shape = ref(TICK)

// Water, not jelly: a press sends slow waves through the outline itself. The
// tick rocks on its foot while ripples run along its edges, and all of it
// swells in gently and dies away.
const DURATION = 2800
const SWELL = 0.14 // seconds for the waves to build
const CALM = 0.62 // seconds for them to fall to about a third
const FOOT = { x: 13, y: 25 }
const TAU = Math.PI * 2
let points: { x: number; y: number }[] | null = null
let frame = 0

/** The outline as closely spaced points, measured once from the drawn path. */
function trace(): typeof points {
  const path = outline.value
  if (!path?.getTotalLength) return null
  const length = path.getTotalLength()
  const count = 120
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = path.getPointAtLength((length * i) / count)
    return { x, y }
  })
}

function flow(t: number): string {
  const level = (1 - Math.exp(-t / SWELL)) * Math.exp(-t / CALM)
  const heave = level * 0.085 * Math.sin(TAU * 1.45 * t) // wider and lower, then taller
  const lean = level * 0.11 * Math.sin(TAU * 1.45 * t + 1.1) // the top drifts sideways
  const moved = points!.map(({ x, y }) => {
    const up = FOOT.y - y
    return {
      x: FOOT.x + (x - FOOT.x) * (1 + heave) + up * lean + level * 1.2 * Math.sin(TAU * (y / 15 - 2.1 * t)),
      y: FOOT.y - up * (1 - heave) + level * 0.9 * Math.sin(TAU * (x / 17 - 1.7 * t) + 0.8)
    }
  })
  // A smooth closed curve through the midpoints, each point pulling a bend.
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `${((a.x + b.x) / 2).toFixed(2)} ${((a.y + b.y) / 2).toFixed(2)}`
  let d = `M${mid(moved[moved.length - 1], moved[0])}`
  moved.forEach((point, i) => {
    d += `Q${point.x.toFixed(2)} ${point.y.toFixed(2)} ${mid(point, moved[(i + 1) % moved.length])}`
  })
  return d + 'Z'
}

function disturb() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  points ??= trace()
  if (!points) return
  cancelAnimationFrame(frame)
  const start = performance.now()
  const step = (now: number) => {
    const elapsed = now - start
    if (elapsed >= DURATION) {
      shape.value = TICK
      return
    }
    shape.value = flow(elapsed / 1000)
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>
