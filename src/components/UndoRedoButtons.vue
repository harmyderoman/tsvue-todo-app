<template>
  <button
    class="btn btn--sm"
    type="button"
    :disabled="!store.canUndo"
    @click="store.undo()"
  >
    <span aria-hidden="true">↶</span> Undo
  </button>
  <button
    class="btn btn--sm"
    type="button"
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
