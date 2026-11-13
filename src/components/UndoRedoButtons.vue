<template>
  <button
    class="btn btn--icon btn--sm btn--quiet"
    type="button"
    aria-label="Undo"
    data-tip="Undo (Ctrl+Z)"
    aria-keyshortcuts="Control+Z"
    :disabled="!store.canUndo"
    @click="store.undo()"
  >
    <glass-icon name="undo" />
  </button>
  <button
    class="btn btn--icon btn--sm btn--quiet"
    type="button"
    aria-label="Redo"
    data-tip="Redo (Ctrl+Shift+Z)"
    aria-keyshortcuts="Control+Shift+Z"
    :disabled="!store.canRedo"
    @click="store.redo()"
  >
    <glass-icon name="redo" />
  </button>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { useNotesStore } from "@/store"
  import GlassIcon from "./GlassIcon.vue"

  export default defineComponent({
    name: "UndoRedoButtons",
    components: { GlassIcon },
    setup() {
      return { store: useNotesStore() }
    }
  })
</script>
