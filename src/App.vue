<template>
  <button
    class="theme-toggle glass"
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :style="{ transform: `perspective(320px) rotateY(${themeRotation}deg)` }"
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
  <div class="tide" aria-hidden="true">
    <span class="tide__pool tide__pool--lagoon"></span>
    <span class="tide__pool tide__pool--coral"></span>
    <span class="tide__pool tide__pool--periwinkle"></span>
  </div>

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
  import { defineComponent, ref } from "vue"
  import { useRoute } from "vue-router"
  import { useDark } from "@vueuse/core"
  import LiquidToggle from "@/components/LiquidToggle.vue"

  export default defineComponent({
    name: "App",
    components: { LiquidToggle },
    setup() {
      const isDark = useDark({
        attribute: "data-theme",
        valueDark: "dark",
        valueLight: "light",
        storageKey: "todo-app:theme",
        disableTransition: false
      })
      const themeRotation = ref(0)
      const toggleTheme = () => {
        themeRotation.value += 360
        isDark.value = !isDark.value
      }
      const route = useRoute()
      return { route, isDark, themeRotation, toggleTheme }
    }
  })
</script>
