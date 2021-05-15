<template>
  <div class="card shadow-soft bg-primary border-light p-4 rounded">
    <div>
      <undo-redo-buttons />
    </div>
    <div class="card-body p-0">
      <note-title :title="note.title" @update-title="updateTitle" />

      <hr />
      <ul>
        <TodoItem
          v-for="(todo, index) in note.todos"
          :todo="todo"
          :key="index"
          @remove-todo="onRemoveTodo(index)"
          @update-todo="onUpdateTodo($event, index)"
          @checkbox-click="onCheckboxClick($event, index)"
        />
      </ul>
      <div>
        <button class="btn btn-primary text-info mr-2 mb-2" @click="addNewTodo">
          Add Todo
        </button>
      </div>
      <hr />
      <div>
        <note-actions />
      </div>
      <hr />
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

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem,
      NoteActions,
      UndoRedoButtons,
      NoteTitle
    },
    setup() {
      const note = computed(() => store.state.currentNote)

      const { currentRoute } = router
      const fetchNote = async () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          store.dispatch("fetchCurrentNote", routeId)
        } else {
          const id = store.getters.getIdOfLastNote + 1
          store.commit("setCurrentNote", { ...store.state.currentNote })
          store.commit("setCurrentId", id)
        }
        await nextTick()
        store.commit("clearHistory")
      }
      onMounted(fetchNote)

      const updateTitle = (title: string) => {
        store.commit("updateTitle", title)
      }

      const addNewTodo = () => {
        store.commit("addNewTodo")
      }

      const onRemoveTodo = (index: number) => {
        store.commit("deleteTodo", index)
      }
      const onUpdateTodo = (text: string, index: number) => {
        let todos = [...store.state.currentNote.todos]

        todos[index] = { ...todos[index], text }
        store.commit("updateTodos", todos)
      }
      const onCheckboxClick = (completed: boolean, index: number) => {
        let todos = [...store.state.currentNote.todos]

        todos[index] = { ...todos[index], completed }
        store.commit("updateTodos", todos)
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
