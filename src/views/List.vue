<template>
  <h2>List of Notes</h2>
  <hr />
  <div
    class="card bg-primary border-light shadow-soft mb-4"
    v-for="note in notes"
    :key="note.id"
  >
    <div class="card-body">
      <h2>{{ note.title }}</h2>
      <ul class="pl-3">
        <li
          :class="{ completed: todo.completed }"
          v-for="(todo, index) in note.todos"
          :key="index"
        >
          {{ todo.text }}
        </li>
      </ul>
    </div>
    <div class="card-footer">
      <button
        class="btn btn-sm btn-primary mr-3"
        @click="$router.push(`/note/${note.id}`)"
      >
        Go to note
      </button>
      <button
        class="btn btn-sm btn-primary text-danger mr-3"
        type="button"
        @click="onDeleteNote(note.id)"
      >
        Delete Note
      </button>
    </div>
  </div>
  <modal-window :show="showModal" @onClose="closeModal">
    <template v-slot:modal-header>
      Are you shure that you want to delete this note?
    </template>
    <template v-slot:modal-body>
      This note will be delete forever!
    </template>
    <template v-slot:modal-actions
      ><button
        type="button"
        class="btn btn-primary text-success"
        @click="confirmDelete(true)"
      >
        Confirm
      </button>
      <button
        type="button"
        class="btn btn-primary text-danger ml-auto"
        @click="confirmDelete(false)"
      >
        Cancel
      </button></template
    >
  </modal-window>
  <p v-if="!notes.length">
    There is no notes right now!<br />
    Click Create Note button to create one.
  </p>
</template>

<script lang="ts">
  import ModalWindow from "@/components/ModalWindow.vue"
  import store from "@/store"
  import { defineComponent, computed, ref } from "vue"
  import {
    useGlobalNotes,
    addNote,
    deleteGlobalNote,
    currentNoteId
  } from "@/state"

  export default defineComponent({
    components: { ModalWindow },
    setup() {
      // const notes = computed(() => store.state.notes)
      const notes = useGlobalNotes()

      const showModal = ref(false)

      const onDeleteNote = (noteId: number) => {
        showModal.value = true
        // store.commit("setCurrentId", noteId)
        currentNoteId.value = noteId
      }
      const confirmDelete = (permission: boolean): void => {
        if (permission) {
          // store.commit("deleteNote")
          deleteGlobalNote(currentNoteId.value)
        }
        closeModal()
      }
      function closeModal() {
        store.commit("setCurrentId", 0)
        showModal.value = false
      }

      return {
        notes,
        onDeleteNote,
        showModal,
        closeModal,
        confirmDelete
      }
    }
  })
</script>

<style>
  .completed {
    text-decoration: line-through;
  }
</style>
