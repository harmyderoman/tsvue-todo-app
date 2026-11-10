<template>
  <button class="btn btn--sm" type="button" :disabled="!canUndo" @click="undo">
    <span aria-hidden="true">↶</span> Undo
  </button>
  <button class="btn btn--sm" type="button" :disabled="!canRedo" @click="redo">
    <span aria-hidden="true">↷</span> Redo
  </button>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import store from "@/store"

  export default defineComponent({
    name: "UndoRedoButtons",
    setup() {
      const canUndo = computed(() => store.getters.canUndo)
      const canRedo = computed(() => store.getters.canRedo)

      const undo = () => {
        store.commit("undoChanges")
      }
      const redo = () => {
        store.commit("redoChanges")
      }

      return {
        undo,
        redo,
        canUndo,
        canRedo
      }
    }
  })
</script>
