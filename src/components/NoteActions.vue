<template>
  <button
    class="btn btn-primary text-success mr-2 mb-2"
    type="button"
    @click="saveNote"
  >
    Save
  </button>
  <button
    class="btn btn-primary text-info mr-2 mb-2"
    type="button"
    @click="cancelEdit"
  >
    Cancel
  </button>
  <button
    class="btn btn-primary text-danger mr-2 mb-2"
    type="button"
    @click="deleteNote"
  >
    Delete
  </button>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import store from "@/store"
  import router from "@/router"

  export default defineComponent({
    name: "NoteActions",

    setup() {
      const note = computed(() => store.state.currentNote)
      const saveNote = () => {
        store.dispatch("saveNote")
        router.push("/")
      }
      const deleteNote = () => {
        store.commit("deleteNote", note)
        router.push("/")
      }
      const cancelEdit = () => {
        // undo changes
        router.push("/")
      }
      return {
        saveNote,
        deleteNote,
        cancelEdit
      }
    }
  })
</script>
