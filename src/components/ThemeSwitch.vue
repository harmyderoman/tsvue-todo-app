<template>
  <button
    class="theme-switch"
    :class="{ 'is-dark': isDark }"
    :style="sizes"
    type="button"
    :aria-label="isDark ? 'Dark theme, switch to light' : 'Light theme, switch to dark'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <span class="theme-switch__pill" aria-hidden="true">
      <span class="theme-switch__label theme-switch__label--light">Light</span>
      <span class="theme-switch__label theme-switch__label--dark">Dark</span>
    </span>

    <span class="theme-switch__lens" aria-hidden="true">
      <!-- What the lens "sees": a copy of the pill, kept in register with the
           real one and bent near the rim by the displacement filter. -->
      <span class="theme-switch__refract" :style="lensMap ? { filter: `url(#${filterId})` } : undefined">
        <span class="theme-switch__pill theme-switch__pill--echo">
          <span class="theme-switch__label theme-switch__label--light">Light</span>
          <span class="theme-switch__label theme-switch__label--dark">Dark</span>
        </span>
      </span>
      <svg class="theme-switch__icon theme-switch__icon--sun" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4.4" stroke="none" />
        <path d="M12 2.6v2.2m0 14.4v2.2M2.6 12h2.2m14.4 0h2.2M5.35 5.35l1.55 1.55m10.2 10.2 1.55 1.55M5.35 18.65l1.55-1.55m10.2-10.2 1.55-1.55" />
      </svg>
      <svg class="theme-switch__icon theme-switch__icon--moon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.6 14.6A9.2 9.2 0 0 1 9.4 3.4a.9.9 0 0 0-1.2-1A10.4 10.4 0 1 0 21.6 15.8a.9.9 0 0 0-1-1.2Z" />
      </svg>
    </span>

    <svg v-if="lensMap" class="theme-switch__defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter :id="filterId" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feImage :href="lensMap" x="0" y="0" :width="LENS_W" :height="LENS_H" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" :scale="REFRACTION * 2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useId } from 'vue'
import { useDark } from '@vueuse/core'
import { lensDisplacementMap } from '@/glass'

// Geometry in CSS px. The lens is taller than the pill and hangs past its end.
const PILL_W = 100
const PILL_H = 36
const LENS_W = 56
const LENS_H = 66
const LENS_RADIUS = 25
const LENS_OVERHANG = 12
// Refraction: the rim band that bends the picture, and by how far at most.
const RIM = 10
const REFRACTION = 10

const sizes = {
  '--pill-w': `${PILL_W}px`,
  '--pill-h': `${PILL_H}px`,
  '--lens-w': `${LENS_W}px`,
  '--lens-h': `${LENS_H}px`,
  '--lens-r': `${LENS_RADIUS}px`,
  '--lens-out': `${LENS_OVERHANG}px`
}

const isDark = useDark({
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'todo-app:theme',
  disableTransition: false
})
const filterId = useId()
const lensMap = ref<string | null>(null)
onMounted(() => {
  lensMap.value = lensDisplacementMap(LENS_W, LENS_H, LENS_RADIUS, RIM)
})

let themeChanging = false
async function toggleTheme(event: MouseEvent) {
  if (themeChanging) return
  const button = event.currentTarget as HTMLElement
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const changeTheme = async () => {
    isDark.value = !isDark.value
    await nextTick()
  }
  if (reducedMotion || !document.startViewTransition) {
    await changeTheme()
    return
  }
  themeChanging = true
  const box = button.getBoundingClientRect()
  const x = box.left + box.width / 2
  const y = box.top + box.height / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(changeTheme)
  try {
    await transition.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 900, easing: 'cubic-bezier(.22, .61, .36, 1)', pseudoElement: '::view-transition-new(root)' }
    )
    await transition.finished
  } catch {
    // A hidden tab can skip the animation; the theme update still runs.
    await transition.updateCallbackDone
  } finally {
    themeChanging = false
  }
}
</script>
