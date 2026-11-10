<template>
  <span class="saved-flag" :class="{ 'is-visible': justSaved }" role="status">
    {{ justSaved ? "Saved" : "" }}
  </span>
  <button
    class="btn btn--accent"
    type="button"
    :disabled="!canSave"
    :title="saveHint"
    @click="saveNote"
  >
    Save
  </button>
  <share-note />
  <button class="btn btn--quiet" type="button" @click="backToNotes">
    Back to notes
  </button>
  <button
    v-if="store.isSavedNote"
    class="btn btn--quiet btn--danger"
    type="button"
    @click="showModal = true"
  >
    Delete
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
  import { computed, defineComponent, onBeforeUnmount, ref } from "vue"
  import { useNotesStore } from "@/store"
  import router from "@/router"
  import ModalWindow from "./ModalWindow.vue"
  import ShareNote from "./ShareNote.vue"

  const SAVED_FLAG_MS = 2500

  export default defineComponent({
    name: "NoteActions",
    components: {
      ShareNote,
      ModalWindow
    },
    setup() {
      const store = useNotesStore()
      const showModal = ref(false)
      const justSaved = ref(false)

      let savedTimer: ReturnType<typeof setTimeout> | undefined
      onBeforeUnmount(() => clearTimeout(savedTimer))

      // Save is live only when it would write something: the note has content
      // and differs from what is already stored.
      const canSave = computed(() => !store.isEmptyNote && store.hasUnsavedChanges)
      const saveHint = computed(() => {
        if (store.isEmptyNote) return "Add a title or a todo first"
        if (!store.hasUnsavedChanges) return "No changes to save"
        return undefined
      })

      const saveNote = () => {
        if (!canSave.value) return
        store.saveNote()
        justSaved.value = true
        clearTimeout(savedTimer)
        savedTimer = setTimeout(() => (justSaved.value = false), SAVED_FLAG_MS)
      }
      // Leaving is guarded in Note.vue, which asks first if there are unsaved changes.
      const backToNotes = () => {
        router.push("/")
      }
      const deleteNote = () => {
        showModal.value = false
        store.deleteNote(store.currentId)
        // Empty the draft too, so leaving doesn't ask about unsaved changes.
        store.closeNote()
        router.push("/")
      }
      return {
        store,
        canSave,
        saveHint,
        saveNote,
        backToNotes,
        deleteNote,
        showModal,
        justSaved
      }
    }
  })
</script>
