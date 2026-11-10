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
        :key="todo.id ?? index"
        :start-editing="todo.id === newTodoId"
        @remove-todo="onRemoveTodo(index)"
        @update-todo="onUpdateTodo($event, index)"
        @checkbox-click="onCheckboxClick($event, index)"
      />
    </transition-group>

    <div>
      <button
        class="btn"
        type="button"
        :disabled="hasEmptyTodo"
        :title="hasEmptyTodo ? 'Fill in the empty todo first' : undefined"
        @click="addNewTodo"
      >
        <span aria-hidden="true">+</span> Add todo
      </button>
    </div>

    <div class="editor__actions">
      <note-actions />
    </div>

    <modal-window :show="pendingPath !== null" @onClose="keepEditing">
      <template v-slot:modal-header>Leave without saving?</template>
      <template v-slot:modal-body>
        Your changes to this note will be lost.
      </template>
      <template v-slot:modal-actions>
        <button type="button" class="btn btn--danger" @click="leave">
          Leave
        </button>
        <button type="button" class="btn btn--quiet" @click="keepEditing">
          Keep editing
        </button>
      </template>
    </modal-window>
  </main>
</template>

<script lang="ts">
  import { defineComponent, computed, onMounted, ref, nextTick } from "vue"
  import TodoItem from "@/components/ToDoItem.vue"

  import NoteActions from "@/components/NoteActions.vue"
  import ModalWindow from "@/components/ModalWindow.vue"
  import { useNotesStore } from "@/store"
  import router from "@/router"
  import { onBeforeRouteLeave } from "vue-router"
  import { pinLeaving } from "@/glass"
  import { useEventListener } from "@vueuse/core"
  import UndoRedoButtons from "@/components/UndoRedoButtons.vue"
  import NoteTitle from "@/components/NoteTitle.vue"

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem,
      NoteActions,
      ModalWindow,
      UndoRedoButtons,
      NoteTitle
    },
    setup() {
      const store = useNotesStore()
      const note = computed(() => store.currentNote)

      // Where the user was heading when the unsaved-changes dialog stopped them.
      const pendingPath = ref<string | null>(null)
      let leaveConfirmed = false

      const { currentRoute } = router
      const fetchNote = async () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          if (!store.openNote(routeId)) {
            // Stale or mistyped link: there is nothing to edit.
            leaveConfirmed = true
            router.replace("/")
            return
          }
        } else {
          store.startNewNote()
        }
        // History records the change above on the next tick; drop it so the
        // freshly opened note has nothing to undo.
        await nextTick()
        store.clearHistory()
      }
      onMounted(fetchNote)

      const updateTitle = (title: string) => {
        store.updateTitle(title)
      }

      // The row that was just added opens ready for typing. The id is only
      // needed while that row mounts; clearing it keeps a row brought back by
      // redo from reopening.
      const newTodoId = ref<number | null>(null)
      // One blank row at a time: a second one would only be dropped on Save.
      const hasEmptyTodo = computed(() =>
        note.value.todos.some((todo) => todo.text === "")
      )
      const addNewTodo = async () => {
        if (hasEmptyTodo.value) return
        newTodoId.value = store.addTodo()
        await nextTick()
        newTodoId.value = null
      }

      // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y) for the note's own history.
      // Inside a text field the browser's undo is left alone, and a dialog
      // on screen means the note is not what the user is working on.
      useEventListener(document, "keydown", (event: KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return
        const key = event.key.toLowerCase()
        const wantsRedo = key === "y" || (key === "z" && event.shiftKey)
        const wantsUndo = key === "z" && !event.shiftKey
        if (!wantsUndo && !wantsRedo) return
        const target = event.target as HTMLElement | null
        if (target?.closest("input:not([type='checkbox']), textarea, [contenteditable]")) return
        if (document.querySelector("[aria-modal='true']")) return
        event.preventDefault()
        if (wantsUndo) store.undo()
        else store.redo()
      })

      const onRemoveTodo = (index: number) => {
        store.removeTodo(index)
      }
      const onUpdateTodo = (text: string, index: number) => {
        store.updateTodo(index, { text })
      }
      const onCheckboxClick = (completed: boolean, index: number) => {
        store.updateTodo(index, { completed })
      }

      // Every way out of the editor (buttons, nav, browser Back) passes here.
      onBeforeRouteLeave((to) => {
        if (store.hasUnsavedChanges && !leaveConfirmed) {
          pendingPath.value = to.fullPath
          return false
        }
        store.closeNote()
      })

      const leave = () => {
        const path = pendingPath.value
        pendingPath.value = null
        leaveConfirmed = true
        if (path) router.push(path)
      }
      const keepEditing = () => {
        pendingPath.value = null
      }

      return {
        note,
        pendingPath,
        leave,
        keepEditing,
        newTodoId,
        hasEmptyTodo,
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
