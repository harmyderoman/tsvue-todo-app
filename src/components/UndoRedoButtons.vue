<template>
  <button
    class="btn btn--sm btn--quiet"
    type="button"
    title="Undo (Ctrl+Z)"
    aria-keyshortcuts="Control+Z"
    :disabled="!store.canUndo"
    @click="store.undo()"
  >
    <span aria-hidden="true">↶</span> Undo
  </button>
  <button
    class="btn btn--sm btn--quiet"
    type="button"
    title="Redo (Ctrl+Shift+Z)"
    aria-keyshortcuts="Control+Shift+Z"
    :disabled="!store.canRedo"
    @click="store.redo()"
  >
    <span aria-hidden="true">↷</span> Redo
  </button>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { useNotesStore } from "@/store"

  export default defineComponent({
    name: "UndoRedoButtons",
    setup() {
      return { store: useNotesStore() }
    }
  })
</script>
