<template>
  <component :is="tag" class="liquid-toggle glass">
    <div ref="track" class="liquid-toggle__track">
      <span class="liquid-toggle__drop nav__drop" :class="{ 'is-visible': visible }" :style="position" aria-hidden="true" />
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'

const props = withDefaults(defineProps<{ active: string; tag?: string }>(), { tag: 'div' })
const track = ref<HTMLElement | null>(null)
const visible = ref(false)
const position = ref<Record<string, string>>({})
async function placeDrop() {
  await nextTick()
  const root = track.value
  const active = root?.querySelector<HTMLElement>('.is-active')
  visible.value = !!active
  if (!root || !active) return
  const box = active.getBoundingClientRect()
  const parent = root.getBoundingClientRect()
  position.value = { '--drop-x': `${box.left - parent.left}px`, '--drop-w': `${box.width}px` }
}
watch(() => props.active, placeDrop)
useResizeObserver(track, placeDrop)
onMounted(() => {
  placeDrop()
  document.fonts?.ready.then(placeDrop)
})
</script>
