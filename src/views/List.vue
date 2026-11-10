<template>
  <main>
    <header class="page-head">
      <h1>Notes</h1>
      <p v-if="notes.length" class="page-head__count">
        {{ notes.length }} {{ notes.length === 1 ? "note" : "notes" }}
      </p>
    </header>

    <transition-group
      tag="div"
      class="notes"
      name="rise"
      appear
      @before-leave="pinLeaving"
    >
      <article
        v-for="(note, index) in notes"
        :key="note.id"
        class="note-card glass"
        :style="{ '--i': index }"
      >
        <h2 class="note-card__title" :class="{ 'is-untitled': !note.title }">
          {{ note.title || "Untitled note" }}
        </h2>

        <ul v-if="note.todos.length" class="note-card__todos">
          <li
            v-for="(todo, todoIndex) in note.todos"
            :key="todoIndex"
            class="note-card__todo"
            :class="{ completed: todo.completed }"
          >
            {{ todo.text }}
          </li>
        </ul>

        <div v-if="note.todos.length" class="note-card__progress">
          <div class="meter">
            <div
              class="meter__fill"
              :style="{ '--done': doneCount(note) / note.todos.length }"
            ></div>
          </div>
          <span>{{ doneCount(note) }} of {{ note.todos.length }} done</span>
        </div>

        <div class="note-card__actions">
          <button
            class="btn btn--sm"
            type="button"
            @click="$router.push(`/note/${note.id}`)"
          >
            Open note
          </button>
          <button
            class="btn btn--sm btn--danger"
            type="button"
            @click="onDeleteNote(note.id)"
          >
            Delete note
          </button>
        </div>
      </article>
    </transition-group>

    <section v-if="!notes.length" class="empty glass">
      <h2>No notes yet</h2>
      <p>Create a note and fill it with things to do.</p>
      <router-link class="btn btn--accent" to="/note">Create a note</router-link>
    </section>

    <modal-window :show="showModal" @onClose="closeModal">
      <template v-slot:modal-header>Delete this note?</template>
      <template v-slot:modal-body>
        The note and its todos will be deleted for good.
      </template>
      <template v-slot:modal-actions>
        <button
          type="button"
          class="btn btn--danger"
          @click="confirmDelete(true)"
        >
          Confirm
        </button>
        <button type="button" class="btn" @click="confirmDelete(false)">
          Cancel
        </button>
      </template>
    </modal-window>
  </main>
</template>

<script lang="ts">
  import ModalWindow from "@/components/ModalWindow.vue"
  import Note from "@/models/NoteModel"
  import store from "@/store"
  import { pinLeaving } from "@/glass"
  import { defineComponent, computed, ref } from "vue"

  export default defineComponent({
    name: "List",
    components: { ModalWindow },
    setup() {
      const notes = computed(() => store.state.notes)

      const showModal = ref(false)

      const doneCount = (note: Note): number =>
        note.todos.filter((todo) => todo.completed).length

      const onDeleteNote = (noteId: number) => {
        showModal.value = true
        store.commit("setCurrentId", noteId)
      }
      const confirmDelete = (permission: boolean): void => {
        if (permission) {
          store.commit("deleteNote")
        }
        closeModal()
      }
      function closeModal() {
        store.commit("setCurrentId", 0)
        showModal.value = false
      }

      return {
        notes,
        doneCount,
        onDeleteNote,
        showModal,
        closeModal,
        confirmDelete,
        pinLeaving
      }
    }
  })
</script>
