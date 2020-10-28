import { createStore } from 'vuex'
import Note from '@/models/NoteModel'
import ToDo from "@/models/ToDoModel"

export default createStore({
  state: {
    notes: [] as Note[],
    currentNote: {
      title: "",
      todos: [] as ToDo[],
      id: 0
    } as Note
  },
  mutations: {
    addNote(state) {
      state.notes.push(state.currentNote)
    },
    deleteNote(state, payload: Note) {
      state.notes = state.notes.filter(note => note.id != state.currentNote.id)
    },
    updateNote(state) {
      let note = state.notes.find(note => note.id === state.currentNote.id)
      note = state.currentNote
    },
    setCurrentNote(state, payload: Note) {
      state.currentNote = payload
    },
    updateTitle(state, payload: string) {
      state.currentNote.title = payload
    },
    updateTodos(state, payload) {
      // let i = state.currentNote.todos.indexOf(payload)
      state.currentNote.todos = payload
    },
    addNewTodo(state) {
      state.currentNote.todos.push({
        text: "",
        completed: false
      })
    },
    deleteTodo(state, index) {
      // let i = state.currentNote.todos.indexOf(todo)
      state.currentNote.todos.splice(index, 1)
    }
  },
  actions: {
    saveNote({ commit }) {

      const isOldNote: boolean = this.state.notes.some(el => el.id === this.state.currentNote.id)
      console.log(isOldNote)
      if (isOldNote) {
        commit('updateNote')
      }
      else {
        commit('addNote');
      }

    },
    fetchCurrentNote({ commit }, noteId: number) {
      let note = this.state.notes.find(note => note.id === noteId)
      commit('setCurrentNote', note)
    },
    updateCurrentNote({ commit }, note: Note) {
      commit('setCurrentNote', note)
    },
    // updateTodo({ commit }, todo: ToDo, index: number){
    //   let todos = this.state.currentNote.todos
    // }

  },
  getters: {
    getIdOfLastNote(state): number {
      if (state.notes.length > 0) {
        const index = state.notes.length - 1

        return state.notes[index].id
      } else {
        return 0
      }
    }
  },
  strict: true

})
