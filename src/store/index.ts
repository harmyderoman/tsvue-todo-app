import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useLocalStorage, useRefHistory } from '@vueuse/core'
import Note from '@/models/NoteModel'
import ToDo from '@/models/ToDoModel'

/** The note being edited: a saved note's content without its id. */
export type Draft = Omit<Note, 'id'>

/** Where saved notes live in localStorage. */
export const STORAGE_KEY = 'todo-app:notes'
/** The Vuex-era entry: `{ notes, currentNote, currentId }`. */
export const LEGACY_STORAGE_KEY = 'vuex'

const emptyDraft = (): Draft => ({ title: '', todos: [] })

// Todo ids only have to be unique inside one note; they give the editor a
// stable key per row. Seeded from the clock so they don't repeat after reload.
let todoIdSeq = Date.now()
const withTodoId = (todo: ToDo): ToDo =>
  todo.id === undefined ? { ...todo, id: todoIdSeq++ } : todo

const copyTodos = (todos: ToDo[]): ToDo[] => todos.map(todo => ({ ...todo }))

/** What Save would actually store: text and state of the non-empty todos. */
const meaningful = (draft: Draft) => ({
  title: draft.title,
  todos: draft.todos
    .filter(todo => todo.text !== '')
    .map(({ text, completed }) => ({ text, completed }))
})

/**
 * Carries notes over from the Vuex version of the app the first time the
 * Pinia version runs. The old entry is left in place, untouched.
 */
function migrateLegacyNotes(): void {
  if (localStorage.getItem(STORAGE_KEY) !== null) return
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacy === null) return
  try {
    const notes = JSON.parse(legacy)?.notes
    if (Array.isArray(notes)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }
  } catch {
    // Unreadable legacy data: start with no notes rather than fail to load.
  }
}

export const useNotesStore = defineStore('notes', () => {
  migrateLegacyNotes()

  // Only saved notes survive a reload. The draft deliberately does not: a
  // persisted draft would resurface later as the content of a "new" note.
  const notes = useLocalStorage<Note[]>(STORAGE_KEY, [])
  if (!Array.isArray(notes.value)) notes.value = []

  const currentNote = ref<Draft>(emptyDraft())
  const currentId = ref(0)

  const {
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory
  } = useRefHistory(currentNote, { deep: true })

  // Getters

  const idOfLastNote = computed(() =>
    notes.value.length ? notes.value[notes.value.length - 1].id : 0
  )
  /** Whether the note in the editor has been saved at least once. */
  const isSavedNote = computed(() =>
    notes.value.some(note => note.id === currentId.value)
  )
  /** Whether the editor holds changes that Save would write. */
  const hasUnsavedChanges = computed(() => {
    const saved = notes.value.find(note => note.id === currentId.value)
    return (
      JSON.stringify(meaningful(currentNote.value)) !==
      JSON.stringify(meaningful(saved ?? emptyDraft()))
    )
  })

  // Opening and closing the editor

  function startNewNote(): void {
    currentNote.value = emptyDraft()
    currentId.value = idOfLastNote.value + 1
  }
  /** Loads a saved note into the editor. Returns false if it doesn't exist. */
  function openNote(noteId: number): boolean {
    const saved = notes.value.find(note => note.id === noteId)
    if (!saved) return false
    currentNote.value = {
      title: saved.title,
      // Notes saved by older versions have todos without ids.
      todos: copyTodos(saved.todos).map(withTodoId)
    }
    currentId.value = noteId
    return true
  }
  function closeNote(): void {
    currentNote.value = emptyDraft()
    currentId.value = 0
  }

  // Editing the draft

  function updateTitle(title: string): void {
    currentNote.value.title = title
  }
  /** Adds an empty todo at the end and returns its id. */
  function addTodo(): number {
    const todo = withTodoId({ text: '', completed: false })
    currentNote.value.todos.push(todo)
    return todo.id as number
  }
  function updateTodo(index: number, changes: Partial<ToDo>): void {
    const todos = currentNote.value.todos
    todos[index] = { ...todos[index], ...changes }
  }
  function removeTodo(index: number): void {
    currentNote.value.todos.splice(index, 1)
  }

  // Saved notes

  /** Writes the draft to the saved notes, dropping todos without text. */
  function saveNote(): void {
    const draft = currentNote.value
    draft.todos = draft.todos.filter(todo => todo.text !== '')
    // The saved note gets its own copy of the todos. Sharing the array with
    // the draft would let later unsaved edits leak into the saved note.
    const saved: Note = {
      id: currentId.value,
      title: draft.title,
      todos: copyTodos(draft.todos)
    }
    const index = notes.value.findIndex(note => note.id === saved.id)
    if (index === -1) {
      notes.value.push(saved)
    } else {
      notes.value[index] = saved
    }
  }
  function deleteNote(noteId: number): void {
    notes.value = notes.value.filter(note => note.id !== noteId)
  }

  return {
    notes,
    currentNote,
    currentId,
    idOfLastNote,
    isSavedNote,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    startNewNote,
    openNote,
    closeNote,
    updateTitle,
    addTodo,
    updateTodo,
    removeTodo,
    saveNote,
    deleteNote,
    undo,
    redo,
    clearHistory
  }
})
