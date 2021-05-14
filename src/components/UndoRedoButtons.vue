<template>
  <button
    class="btn btn-primary text-success mr-2 mb-2"
    type="button"
    :disabled="!canUndo"
    @click="undo"
  >
    Undo
  </button>
  <button
    class="btn btn-primary text-info mr-2 mb-2"
    type="button"
    @click="redo"
    :disabled="!canRedo"
  >
    Redo
  </button>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import store from "@/store"

  export default defineComponent({
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
