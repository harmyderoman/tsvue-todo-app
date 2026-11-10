<template>
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
  import { useEventListener } from "@vueuse/core"

  export default defineComponent({
    name: "App",
    setup() {
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

      return { navList, dropVisible }
    }
  })
</script>
