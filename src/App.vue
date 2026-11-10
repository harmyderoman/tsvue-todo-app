<template>
  <button
    class="theme-toggle glass"
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
      <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
    </svg>
  </button>
  <background-texture />

  <div class="shell">
    <liquid-toggle tag="nav" class="nav" aria-label="Main" :active="route.path">
      <ul class="nav__list">
        <li>
          <router-link class="nav__link" to="/" exact-active-class="is-active">
            Notes
          </router-link>
        </li>
        <li>
          <router-link class="nav__link" to="/note" exact-active-class="is-active">
            New note
          </router-link>
        </li>
      </ul>
    </liquid-toggle>

    <router-view v-slot="{ Component, route }">
      <transition name="melt" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
  import { defineComponent, nextTick } from "vue"
  import { useRoute } from "vue-router"
  import { useDark } from "@vueuse/core"
  import LiquidToggle from "@/components/LiquidToggle.vue"
  import BackgroundTexture from "@/components/BackgroundTexture.vue"

  export default defineComponent({
    name: "App",
    components: { LiquidToggle, BackgroundTexture },
    setup() {
      const isDark = useDark({
        attribute: "data-theme",
        valueDark: "dark",
        valueLight: "light",
        storageKey: "todo-app:theme",
        disableTransition: false
      })
      let themeChanging = false
      const toggleTheme = async (event: MouseEvent) => {
        if (themeChanging) return
        const button = event.currentTarget as HTMLButtonElement
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        const changeTheme = async () => {
          isDark.value = !isDark.value
          await nextTick()
        }
        if (reducedMotion || !document.startViewTransition) {
          await changeTheme()
          if (reducedMotion) return
        } else {
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
        button.getAnimations?.().forEach(animation => animation.cancel())
        button.animate?.([
          { transform: 'scale(1, 1)', borderRadius: '50%' },
          { transform: 'scale(1.3, .78)', borderRadius: '46% 54% 62% 38% / 60% 42% 58% 40%', offset: .3 },
          { transform: 'scale(.88, 1.15)', borderRadius: '58% 42% 40% 60% / 42% 60% 40% 58%', offset: .6 },
          { transform: 'scale(1.06, .96)', borderRadius: '48% 52% 54% 46%', offset: .8 },
          { transform: 'scale(1, 1)', borderRadius: '50%' }
        ], { duration: 850, easing: 'ease-in-out' })
      }
      const route = useRoute()
      return { route, isDark, toggleTheme }
    }
  })
</script>
