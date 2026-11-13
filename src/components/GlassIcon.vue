<template>
  <!-- Duotone: an outline in the button's ink over a body filled with the
       button's own colour. Parts that move on hover carry their own class;
       the gestures live in main.css under "Icon buttons". -->
  <svg
    class="glass-icon"
    :class="`glass-icon--${name}`"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'trash'">
      <path class="glass-icon__fill" d="M6.3 8.2h11.4l-.84 10.9a2 2 0 0 1-2 1.85H9.14a2 2 0 0 1-2-1.85Z" />
      <path d="M10 11.6v5.6M14 11.6v5.6" />
      <g class="glass-icon__lid">
        <path d="M4.4 6.4h15.2" />
        <path d="M9.4 6.4V5a1.6 1.6 0 0 1 1.6-1.6h2A1.6 1.6 0 0 1 14.6 5v1.4" />
      </g>
    </template>

    <template v-else-if="name === 'pencil'">
      <g class="glass-icon__pencil">
        <path class="glass-icon__fill" d="M16.2 4a2.2 2.2 0 0 1 3.1 0l.7.7a2.2 2.2 0 0 1 0 3.1L9.3 18.5l-4.5 1.1 1.1-4.5Z" />
        <path d="M14.3 5.9l3.8 3.8" />
      </g>
      <path class="glass-icon__line" d="M12.6 20h6.8" />
    </template>

    <path v-else-if="name === 'check'" class="glass-icon__draw" d="M5 12.8l4.4 4.4L19 7.4" stroke-width="2.3" />

    <template v-else-if="name === 'save'">
      <path
        class="glass-icon__fill"
        d="M4 6.2A2.2 2.2 0 0 1 6.2 4h9.6L20 8.2v9.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 17.8Z"
      />
      <path class="glass-icon__shutter" d="M8 4v3.4a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1V4" />
      <path d="M7.6 20v-4.9a1 1 0 0 1 1-1h6.8a1 1 0 0 1 1 1V20" />
    </template>

    <template v-else-if="name === 'share'">
      <path
        class="glass-icon__fill"
        d="M8.6 10H7.3A2.3 2.3 0 0 0 5 12.3v5.4A2.3 2.3 0 0 0 7.3 20h9.4a2.3 2.3 0 0 0 2.3-2.3v-5.4A2.3 2.3 0 0 0 16.7 10h-1.3"
      />
      <g class="glass-icon__arrow">
        <path d="M12 14.6V3.8" />
        <path d="M8.4 7.3 12 3.7l3.6 3.6" />
      </g>
    </template>

    <path v-else-if="name === 'close'" d="M7 7l10 10M17 7 7 17" stroke-width="2.2" />

    <template v-else-if="name === 'grid'">
      <rect class="glass-icon__fill glass-icon__part" x="4" y="4" width="7" height="7" rx="2" />
      <rect class="glass-icon__fill glass-icon__part" x="13" y="4" width="7" height="7" rx="2" />
      <rect class="glass-icon__fill glass-icon__part" x="4" y="13" width="7" height="7" rx="2" />
      <rect class="glass-icon__fill glass-icon__part" x="13" y="13" width="7" height="7" rx="2" />
    </template>

    <template v-else-if="name === 'rows'">
      <rect class="glass-icon__fill glass-icon__part" x="4" y="4.4" width="16" height="4" rx="1.6" />
      <rect class="glass-icon__fill glass-icon__part" x="4" y="10" width="16" height="4" rx="1.6" />
      <rect class="glass-icon__fill glass-icon__part" x="4" y="15.6" width="16" height="4" rx="1.6" />
    </template>

    <g v-else-if="name === 'undo'" class="glass-icon__spin">
      <path d="M9 14.6 4.5 10.1 9 5.6" />
      <path d="M4.5 10.1h9.7a5 5 0 0 1 0 10H11" />
    </g>

    <g v-else-if="name === 'redo'" class="glass-icon__spin">
      <path d="M15 14.6l4.5-4.5L15 5.6" />
      <path d="M19.5 10.1H9.8a5 5 0 0 0 0 10H13" />
    </g>
  </svg>
</template>

<script setup lang="ts">
export type GlassIconName =
  | 'trash' | 'pencil' | 'check' | 'save' | 'share' | 'close' | 'undo' | 'redo' | 'grid' | 'rows'

defineProps<{ name: GlassIconName }>()
</script>
