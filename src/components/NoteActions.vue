<template>
  <share-note />
  <button
    v-if="store.isSavedNote"
    class="btn btn--icon btn--danger"
    type="button"
    aria-label="Delete note"
    title="Delete note"
    @click="showModal = true"
  >
    <glass-icon name="trash" />
  </button>
  <modal-window :show="showModal" @onClose="showModal = false">
    <template v-slot:modal-header>Delete this note?</template>
    <template v-slot:modal-body>
      The note and its todos will be deleted for good.
    </template>
    <template v-slot:modal-actions>
      <button type="button" class="btn btn--danger" @click="deleteNote">
        Delete
      </button>
      <button type="button" class="btn btn--quiet" @click="showModal = false">
        Cancel
      </button>
    </template>
  </modal-window>
</template>

<script lang="ts">
  import { defineComponent, ref } from "vue"
  import { useNotesStore } from "@/store"
  import router from "@/router"
  import ModalWindow from "./ModalWindow.vue"
  import ShareNote from "./ShareNote.vue"
  import GlassIcon from "./GlassIcon.vue"

  export default defineComponent({
    name: "NoteActions",
    components: {
      ShareNote,
      ModalWindow,
      GlassIcon
    },
    setup() {
      const store = useNotesStore()
      const showModal = ref(false)

      const deleteNote = () => {
        showModal.value = false
        store.deleteNote(store.currentId)
        // Empty the draft too, so autosave has nothing left to write back.
        store.closeNote()
        router.push("/")
      }
      return { store, deleteNote, showModal }
    }
  })
</script>
