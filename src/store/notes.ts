import { defineStore } from 'pinia'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { useStorage } from '@vueuse/core'


export const useNotes = defineStore('notes', {
  state: () => ({
    notes: useStorage("my-notes", [] as Note[]),
    currentNote: {
      title: "",
      todos: [] as ToDo[]
    },
    currentNoteId: 0
  }),
  actions: {
    addNote() {
      this.notes.push({ id: this.currentNoteId, ...this.currentNote })
    },
    filterEmptyTodos() {
      this.currentNote.todos = this.currentNote.todos.filter(todo => todo.text)
    },
    updateNote() {

      let note = this.notes.find(note => note.id === this.currentNoteId)

      if (note) {
        this.filterEmptyTodos()
        let index = this.notes.indexOf(note as Note)
        this.notes[index] = { id: this.currentNoteId, ...this.currentNote }
      } else {

        this.filterEmptyTodos()
        this.addNote()
      }
    },
    deleteNote(noteId: number) {
      this.notes = this.notes.filter(note => note.id != noteId)
    },
  },
  getters: {
    getIdOfLastNote: (state) => {
      if (state.notes.length) {
        const index = state.notes.length - 1
        return state.notes[index].id
      } else {
        return 0
      }
    }
  }

})