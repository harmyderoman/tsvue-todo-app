<template>
  <button
    class="theme-toggle glass"
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="isDark = !isDark"
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
    <nav class="nav glass" aria-label="Main">
      <ul ref="navList" class="nav__list">
        <li class="nav__drop" :class="{ 'is-visible': dropVisible }" aria-hidden="true"></li>
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
    </nav>

    <router-view v-slot="{ Component, route }">
      <transition name="melt" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
  import { defineComponent, nextTick, onMounted, ref, watch } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { useDark, useEventListener } from "@vueuse/core"

  export default defineComponent({
    name: "App",
    setup() {
      const isDark = useDark({
        attribute: "data-theme",
        valueDark: "dark",
        valueLight: "light",
        storageKey: "todo-app:theme"
      })
      const route = useRoute()
      const router = useRouter()
      const navList = ref<HTMLElement | null>(null)
      const dropVisible = ref(false)

      // Slide the droplet under whichever tab is active; hide it on routes
      // that have no tab (editing an existing note).
      const placeDrop = async () => {
        await nextTick()
        const list = navList.value
        if (!list) return
        const active = list.querySelector<HTMLElement>(".nav__link.is-active")
        dropVisible.value = !!active
        if (!active) return
        list.style.setProperty("--drop-x", `${active.offsetLeft}px`)
        list.style.setProperty("--drop-w", `${active.offsetWidth}px`)
      }

      watch(() => route.path, placeDrop)
      onMounted(() => {
        // The first route resolves after mount, so no tab is active before that.
        router.isReady().then(placeDrop)
        // Tab widths change once the web font arrives.
        document.fonts?.ready.then(placeDrop)
      })
      useEventListener(window, "resize", placeDrop)

      return { navList, dropVisible, isDark }
    }
  })
</script>
