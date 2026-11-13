<template>
  <main class="editor glass">
    <div class="editor__bar">
      <undo-redo-buttons />
      <span class="saved-flag" :class="{ 'is-visible': justSaved }" role="status">
        <template v-if="justSaved"><glass-icon name="save" /> Saved</template>
      </span>
      <button
        class="btn btn--icon btn--quiet editor__close"
        type="button"
        aria-label="Close note"
        data-tip="Close note (Esc)"
        aria-keyshortcuts="Escape"
        @click="closeEditor"
      >
        <glass-icon name="close" />
      </button>
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
        @add-next="addNewTodo"
      />
    </transition-group>

    <div class="editor__footer">
      <button
        class="btn"
        type="button"
        :disabled="hasEmptyTodo"
        :data-tip="hasEmptyTodo ? 'Fill in the empty todo first' : undefined"
        @click="addNewTodo"
      >
        <span aria-hidden="true">+</span> Add todo
      </button>
      <div class="editor__actions">
        <note-actions />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { defineComponent, computed, onBeforeUnmount, onMounted, ref, nextTick, watch } from "vue"
  import TodoItem from "@/components/ToDoItem.vue"

  import NoteActions from "@/components/NoteActions.vue"
  import GlassIcon from "@/components/GlassIcon.vue"
  import { useNotesStore } from "@/store"
  import router from "@/router"
  import { onBeforeRouteLeave } from "vue-router"
  import { pinLeaving } from "@/glass"
  import { useEventListener } from "@vueuse/core"
  import UndoRedoButtons from "@/components/UndoRedoButtons.vue"
  import NoteTitle from "@/components/NoteTitle.vue"

  const SAVED_FLAG_MS = 1600

  export default defineComponent({
    name: "Note",
    components: {
      TodoItem,
      NoteActions,
      GlassIcon,
      UndoRedoButtons,
      NoteTitle
    },
    setup() {
      const store = useNotesStore()
      const note = computed(() => store.currentNote)

      const { currentRoute } = router
      const fetchNote = async () => {
        if (currentRoute.value.params.id) {
          const routeId: number = +currentRoute.value.params.id
          if (!store.openNote(routeId)) {
            // Stale or mistyped link: there is nothing to edit.
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

      // Autosave: every change that Save would have written is written as it
      // happens, undo and redo included. A new note is only stored once it
      // has something in it.
      const justSaved = ref(false)
      let savedTimer: ReturnType<typeof setTimeout> | undefined
      onBeforeUnmount(() => clearTimeout(savedTimer))
      const persist = () => {
        if (!store.currentId || !store.hasUnsavedChanges) return
        if (store.isEmptyNote && !store.isSavedNote) return
        store.saveNote()
        justSaved.value = true
        clearTimeout(savedTimer)
        savedTimer = setTimeout(() => (justSaved.value = false), SAVED_FLAG_MS)
      }
      watch(() => store.currentNote, persist, { deep: true })

      const updateTitle = (title: string) => {
        store.updateTitle(title)
      }

      // The row that was just added opens ready for typing. The id is only
      // needed while that row mounts; clearing it keeps a row brought back by
      // redo from reopening.
      const newTodoId = ref<number | null>(null)
      // One blank row at a time: a second one would never be stored.
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

      const closeEditor = () => {
        router.push("/")
      }

      // Escape closes the note, like the cross. A dialog on screen takes the
      // key for itself, and inside a text field Escape only closes the field.
      useEventListener(document, "keydown", (event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented) return
        if (document.querySelector("[aria-modal='true']")) return
        const target = event.target as HTMLElement | null
        if (target?.closest("input:not([type='checkbox']), textarea, [contenteditable]")) return
        closeEditor()
      })

      // Every way out of the editor (the close button, nav, browser Back)
      // passes here. Write any change the watcher hasn't reached yet, and
      // don't leave a note behind that was emptied out.
      onBeforeRouteLeave(() => {
        persist()
        if (store.isSavedNote && store.isEmptyNote) store.deleteNote(store.currentId)
        store.closeNote()
      })

      return {
        note,
        justSaved,
        closeEditor,
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
