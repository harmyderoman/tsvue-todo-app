import { createGlobalState, useStorage, useRefHistory } from '@vueuse/core'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { ref, computed } from 'vue'

export const useGlobalNotes = createGlobalState(
  () => useStorage('my-notes', [] as Note[]),
)
const notes = useGlobalNotes()

export const useGlobalCurrentNote = createGlobalState(
  () => {
    return {
      title: "",
      todos: [] as ToDo[]
    }
  }
)
const currentNote = useGlobalCurrentNote()

export const currentNoteId = ref(0)

export const addNote = function () {
  notes.value.push({ id: currentNoteId.value, ...currentNote })
}

export const updateNote = function () {
  let note = notes.value.find(note => note.id === currentNoteId.value)
  let index = notes.value.indexOf(note as Note)
  // const id = currentNoteId.value
  notes.value[index] = { id: currentNoteId.value, ...currentNote }
}

export const deleteGlobalNote = function (noteId: number) {
  notes.value = notes.value.filter(note => note.id != noteId)
}

export const getIdOfLastNote = computed(() => {
  if (notes.value.length > 0) {
    const index = notes.value.length - 1

    return notes.value[index].id
  } else {
    return 0
  }
})
