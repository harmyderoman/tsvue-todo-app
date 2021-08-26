
import { createGlobalState, useStorage } from '@vueuse/core'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { ref, computed } from 'vue'

// state
export const useGlobalNotes = createGlobalState(
  () => useStorage('my-notes', [] as Note[]),
)

export const currentNote = ref({
  title: "",
  todos: [] as ToDo[]
})

export const currentNoteId = ref(0)

// actions

const notes = useGlobalNotes() // for local use

const filterEmptyTodos = function () {
  currentNote.value.todos = currentNote.value.todos.filter(todo => todo.text)
}

export const addNote = function () {
  notes.value.push({ id: currentNoteId.value, ...currentNote.value })
}

export const updateNote = function () {

  let note = notes.value.find(note => note.id === currentNoteId.value)

  if (note) {
    filterEmptyTodos()
    let index = notes.value.indexOf(note as Note)
    notes.value[index] = { id: currentNoteId.value, ...currentNote.value }
  } else {

    filterEmptyTodos()
    addNote()
  }
}

export const deleteGlobalNote = function (noteId: number) {
  notes.value = notes.value.filter(note => note.id != noteId)
}

// getters
export const getIdOfLastNote = computed(() => {
  if (notes.value.length) {
    const index = notes.value.length - 1
    return notes.value[index].id
  } else {
    return 0
  }
})
