<template>
  <app-logo />
  <theme-switch />
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

  <router-link v-if="route.path !== '/about'" class="about-link btn btn--sm btn--quiet" to="/about">About</router-link>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { useRoute } from "vue-router"
  import LiquidToggle from "@/components/LiquidToggle.vue"
  import BackgroundTexture from "@/components/BackgroundTexture.vue"
  import ThemeSwitch from "@/components/ThemeSwitch.vue"
  import AppLogo from "@/components/AppLogo.vue"

  export default defineComponent({
    name: "App",
    components: { LiquidToggle, BackgroundTexture, ThemeSwitch, AppLogo },
    setup() {
      const route = useRoute()
      return { route }
    }
  })
</script>
