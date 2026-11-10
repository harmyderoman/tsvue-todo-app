<template>
  <main class="editor glass">
    <div class="editor__bar">
      <undo-redo-buttons />
    </div>

    <note-title :title="note.title" @update-title="updateTitle" />

    <transition-group
      tag="ul"
      class="todos"
      name="rise"
      @before-leave="pinLeaving"
    >
      <TodoItem
        v-for="(todo, index) in note.todos"
        :todo="todo"
        :key="todoKeys[index]"
        @remove-todo="onRemoveTodo(index)"
        @update-todo="onUpdateTodo($event, index)"
        @checkbox-click="onCheckboxClick($event, index)"
      />
    </transition-group>

    <div>
      <button class="btn" type="button" @click="addNewTodo">
        <span aria-hidden="true">+</span> Add todo
      </button>
    </div>

    <div class="editor__actions">
      <note-actions />
    </div>
  </main>
</template>

<script lang="ts">
  import { defineComponent, computed, onMounted, ref, nextTick, watch } from "vue"
  import TodoItem from "@/components/ToDoItem.vue"

  import NoteActions from "@/components/NoteActions.vue"
  import Note from "@/models/NoteModel"
  import ToDo from "@/models/ToDoModel"
  import store from "@/store"
  import router from "@/router"
  import { onBeforeRouteLeave } from "vue-router"
  import { pinLeaving } from "@/glass"
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

      // Todos carry no id, so keep a parallel list of stable keys. Without it
      // removing a row would animate the last row out instead of the removed one.
      let nextKey = 0
      const todoKeys = ref<number[]>(note.value.todos.map(() => nextKey++))
      watch(
        () => note.value.todos.length,
        (length) => {
          // Reconcile after changes made elsewhere (undo/redo, loading a note).
          while (todoKeys.value.length < length) todoKeys.value.push(nextKey++)
          todoKeys.value.length = length
        },
        { flush: "sync" }
      )

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
        todoKeys.value.splice(index, 1)
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

      onBeforeRouteLeave(() => {
        clearNote()
        store.commit("setCurrentId", store.getters.getIdOfLastNote + 1)
      })

      return {
        note,
        todoKeys,
        addNewTodo,
        onRemoveTodo,
        onUpdateTodo,
        updateTitle,
        onCheckboxClick,
        pinLeaving
      }
    }
  })
</script>
