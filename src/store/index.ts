import { createStore } from 'vuex'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"
import { useStorage, useRefHistory } from '@vueuse/core'
import { ref } from 'vue'

const localStorageNotes: any = useStorage('my-notes', [] as Note[])
const note: any = ref({
  title: "",
  todos: [] as ToDo[]
})
const { history, undo, redo, canUndo, canRedo, clear } = useRefHistory(note, {
  deep: true
})

export default createStore({
  state: {
    notes: localStorageNotes as Note[],
    currentNote: note as Note,
    currentId: 0
  },
  mutations: {
    // Notes

    addNote(state) {
      const id = state.currentId
      state.notes.push({ ...state.currentNote, id })
    },
    deleteNote(state) {
      state.notes = state.notes.filter(note => note.id != state.currentId)
    },
    updateNote(state) {
      let note = state.notes.find(note => note.id === state.currentId)
      let index = state.notes.indexOf(note as Note)
      const id = state.currentId
      state.notes[index] = { ...state.currentNote, id }
    },


    // Current Note 
    setCurrentNote(state, payload: Note) {
      state.currentNote.title = payload.title
      state.currentNote.todos = payload.todos
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

    // History
    clearHistory() {
      clear()
    },
    undoChanges() {
      undo()
    },
    redoChanges() {
      redo()
    },

    // Current Id
    setCurrentId(state, payload: number) {
      state.currentId = payload
    },
  },
  actions: {
    saveNote({ commit }) {
      const isOldNote: boolean = this.state.notes.some(el => el.id === this.state.currentId)
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
      commit('setCurrentId', noteId)
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
