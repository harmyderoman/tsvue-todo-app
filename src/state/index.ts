// import { Note } from '@/views/Note.vue';
import { createGlobalState, useStorage, useRefHistory } from '@vueuse/core'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { ref } from 'vue'

export const useGlobalNotes = createGlobalState(
  () => useStorage('my-notes', [{
    title: "",
    todos: [] as ToDo[]
  }] as Note[]),
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
const note = useGlobalCurrentNote()

const currentNoteId = 0
export const addNote = function () {
  notes.value.push({ id: currentNoteId, ...note })
}
