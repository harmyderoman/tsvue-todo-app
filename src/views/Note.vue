<template>
  <div class="card shadow-inset bg-primary border-light p-4 rounded">
    <div class="d-flex justify-content-start mb-3">
      <div class="col"><undo-redo-buttons /></div>
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
        <button class="btn btn-primary text-info mr-2 mb-2" @click="addNewTodo">
          Add Todo
        </button>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <note-actions />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, onMounted, ref, nextTick } from "vue"
  import TodoItem from "@/components/ToDoItem.vue"

  import NoteActions from "@/components/NoteActions.vue"
  import Note from "@/models/NoteModel"
  import ToDo from "@/models/ToDoModel"
  import store from "@/store"
  import router from "@/router"
  import UndoRedoButtons from "@/components/UndoRedoButtons.vue"
  import NoteTitle from "@/components/NoteTitle.vue"
  import {
    useGlobalCurrentNote,
    useGlobalNotes,
    currentNoteId,
    addNote,
    getIdOfLastNote
  } from "@/state"

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem,
      NoteActions,
      UndoRedoButtons,
      NoteTitle
    },
    setup() {
      let note = useGlobalCurrentNote()
      const notes = useGlobalNotes()

      const { currentRoute } = router
      const fetchNote = async () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          currentNoteId.value = routeId
          // store.dispatch("fetchCurrentNote", routeId)
          const fetchedNote = notes.value.find((note) => note.id === routeId)
          if (fetchedNote) {
            note.title = fetchedNote.title
            note.todos = fetchedNote.todos
          }
        } else {
          // const id = getIdOfLastNote.value + 1
          // store.commit("setCurrentNote", { ...store.state.currentNote })
          note.title = ""
          note.todos = [] as ToDo[]
          // store.commit("setCurrentId", id)
          currentNoteId.value = getIdOfLastNote.value + 1
        }
        await nextTick()
        // store.commit("clearHistory")
      }
      onMounted(fetchNote)

      const updateTitle = (title: string) => {
        // store.commit("updateTitle", title)
        note.title = title
      }

      const addNewTodo = () => {
        // store.commit("addNewTodo")
        note.todos.push({} as ToDo)
      }

      const onRemoveTodo = (index: number) => {
        // store.commit("deleteTodo", index)
        note.todos.splice(index, 1)
      }
      const onUpdateTodo = (text: string, index: number) => {
        // let todos = [...store.state.currentNote.todos]
        // todos[index] = { ...todos[index], text }
        // store.commit("updateTodos", todos)
      }
      const onCheckboxClick = (completed: boolean, index: number) => {
        // let todos = [...store.state.currentNote.todos]
        // todos[index] = { ...todos[index], completed }
        // store.commit("updateTodos", todos)
      }

      const clearNote = () => {
        store.commit("setCurrentNote", {
          title: "",
          todos: [] as ToDo[]
        } as Note)
      }

      return {
        note,
        addNewTodo,
        onRemoveTodo,
        onUpdateTodo,
        clearNote,
        updateTitle,
        onCheckboxClick
      }
    },
    beforeRouteLeave(to, from, next) {
      this.clearNote()
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
