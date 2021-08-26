<template>
  <div class="card shadow-inset bg-primary border-light p-4 rounded">
    <div class="d-flex justify-content-start mb-3">
      <div class="col">
        <button
          class="btn btn-primary text-success mr-2 mb-2"
          type="button"
          @click="undo"
          :disabled="!canUndo"
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
      </div>
    </div>

    <div class="card bg-primary border-light shadow-soft p-4">
      <note-title :title="note.title" @update-title="updateTitle" />

      <ul>
        <TodoItem
          v-for="(todo, index) in note.todos"
          :todo="todo"
          :key="index"
          @remove-todo="onRemoveTodo(index)"
        />
      </ul>

      <div>
        <button class="btn btn-primary text-info ml-2 mb-2" @click="addNewTodo">
          Add New Todo
        </button>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <note-actions />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, nextTick } from "vue"
  import TodoItem from "@/components/ToDoItem.vue"

  import NoteActions from "@/components/NoteActions.vue"
  import ToDo from "@/models/ToDoModel"
  import router from "@/router"
  import NoteTitle from "@/components/NoteTitle.vue"
  import {
    useGlobalNotes,
    currentNoteId,
    getIdOfLastNote,
    currentNote
  } from "@/store"
  import { useRefHistory } from "@vueuse/core"

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem,
      NoteActions,
      NoteTitle
    },
    setup() {
      const notes = useGlobalNotes()

      const note = currentNote
      const {
        history,
        undo,
        redo,
        canUndo,
        canRedo,
        clear
      } = useRefHistory(note, { deep: true })

      const { currentRoute } = router
      const fetchNote = async () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          currentNoteId.value = routeId
          const fetchedNote = notes.value.find((note) => note.id === routeId)
          if (fetchedNote) {
            note.value.title = fetchedNote.title
            note.value.todos = fetchedNote.todos
          }
        } else {
          note.value.title = ""
          note.value.todos = [] as ToDo[]
          currentNoteId.value = getIdOfLastNote.value + 1
        }
        await nextTick()
        clear()
      }
      onMounted(fetchNote)

      const updateTitle = (title: string) => {
        note.value.title = title
      }

      const addNewTodo = () => {
        note.value.todos.push({} as ToDo)
      }

      const onRemoveTodo = (index: number) => {
        note.value.todos.splice(index, 1)
      }

      const clearNote = () => {
        note.value.todos = []
        note.value.title = ""
        currentNoteId.value = getIdOfLastNote.value + 1
      }

      return {
        note,
        addNewTodo,
        onRemoveTodo,
        clearNote,
        updateTitle,
        undo,
        redo,
        canUndo,
        canRedo,
        clear
      }
    },
    beforeRouteLeave(to, from, next) {
      this.clearNote()
      this.clear()
      next()
    }
  })
</script>

<style>
  .new-todo {
    display: flex;
    justify-content: flex-start;
    background-color: #e2e2e2;
    height: 36px;
    margin: 5px 0px;
    padding-top: 4px;
    padding-left: 10px;
    padding-right: 15px;
    border-radius: 5px;
  }
  ul {
    padding-inline-start: 5px;
  }
</style>
