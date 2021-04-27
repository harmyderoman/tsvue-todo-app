<template>
  <div class="card shadow-soft bg-primary border-light p-4 rounded">
    <div>
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
    </div>
    <hr />
    <div class="card-body p-0">
      <input
        class="form-control"
        :value="note.title"
        @input="updateTitle"
        placeholder="Enter Title"
      />
      <h2>{{ note.title }}</h2>
      <!-- <hr /> -->
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
          @click="DeleteNote"
        >
          Delete
        </button>
      </div>
      <hr />
    </div>
  </div>
</template>

<script lang="ts">
  import TodoItem from "@/components/ToDoItem.vue"
  import { defineComponent, computed, onMounted } from "vue"
  import Note from "@/models/NoteModel"
  import ToDo from "@/models/ToDoModel"
  import store from "@/store"
  import router from "@/router"

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem
    },
    setup() {
      const note = computed(() => store.state.currentNote)
      const canUndo = computed(() => store.getters.canUndo)
      const canRedo = computed(() => store.getters.canRedo)

      const saveNote = () => {
        store.dispatch("saveNote")
        router.push("/")
      }
      const DeleteNote = () => {
        store.commit("deleteNote", note)
        router.push("/")
      }

      const { currentRoute } = router
      const fetchNote = () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          store.dispatch("fetchCurrentNote", routeId)
        } else {
          const id = store.getters.getIdOfLastNote + 1
          store.commit("setCurrentNote", { ...store.state.currentNote, id })
        }
      }
      onMounted(fetchNote)

      const updateTitle = (e: { target: { value: string } }) => {
        store.commit("updateTitle", e.target.value)
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

      const cancelEdit = () => {
        // undo changes
        router.push("/")
      }
      const clearNote = () => {
        const id = store.getters.getIdOfLastNote + 1
        store.commit("setCurrentNote", {
          title: "",
          todos: [] as ToDo[],
          id: id
        } as Note)
      }
      const undo = () => {
        store.commit("undoChanges")
      }
      const redo = () => {
        store.commit("redoChanges")
      }

      return {
        note,
        undo,
        redo,
        canUndo,
        canRedo,
        saveNote,
        addNewTodo,
        cancelEdit,
        onRemoveTodo,
        onUpdateTodo,
        DeleteNote,
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
