import { createStore } from 'vuex'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { useStorage, useRefHistory } from '@vueuse/core'
import { ref } from 'vue'

const localStorageNotes: any = useStorage('my-notes', [] as Note[])
const note: any = ref({
  title: "",
  todos: [] as ToDo[],
  id: 0
} as Note)
const { history, undo, redo, canUndo, canRedo } = useRefHistory(note, {
  deep: true
})

export default createStore({
  state: {
    notes: localStorageNotes as Note[],
    currentNote: note as Note
  },
  mutations: {
    addNote(state) {
      state.notes.push(state.currentNote)
    },
    deleteNote(state) {
      state.notes = state.notes.filter(note => note.id != state.currentNote.id)
    },
    updateNote(state) {
      let note = state.notes.find(note => note.id === state.currentNote.id)
      let index = state.notes.indexOf(note as Note)
      state.notes[index] = state.currentNote
    },
    setCurrentNote(state, payload: Note) {
      state.currentNote = payload
    },
    updateTitle(state, payload: string) {
      state.currentNote.title = payload
    },
    updateTodos(state, payload: ToDo[]) {
      state.currentNote.todos = payload
    },
    addNewTodo(state) {
      state.currentNote.todos.push({
        text: "",
        completed: false
      })
    },
    deleteTodo(state, index: number) {
      state.currentNote.todos.splice(index, 1)
    },
    undoChanges() {
      undo()
    },
    redoChanges() {
      redo()
    }
  },
  actions: {
    saveNote({ commit }) {
      const isOldNote: boolean = this.state.notes.some(el => el.id === this.state.currentNote.id)
      if (isOldNote) {
        commit('updateNote')
      }
      else {
        commit('addNote');
      }

    },
    fetchCurrentNote({ commit }, noteId: number) {
      let note = JSON.parse(JSON.stringify(this.state.notes.find(note => note.id === noteId)))
      commit('setCurrentNote', note)
    },
    updateCurrentNote({ commit }, note: Note) {
      commit('setCurrentNote', note)
    }

  },
  getters: {
    getIdOfLastNote(state): number {
      if (state.notes.length > 0) {
        const index = state.notes.length - 1

        return state.notes[index].id
      } else {
        return 0
      }
    },
    canUndo() {
      return canUndo.value
    },
    canRedo() {
      return canRedo.value
    }
  },
  strict: true

})
