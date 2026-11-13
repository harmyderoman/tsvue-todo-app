<template>
  <main class="editor glass">
    <template v-if="note">
      <p>Shared note · Editing creates a copy on this device.</p>
      <h1><button class="note-title" type="button" @click="edit()">{{ note.title || 'Untitled note' }}</button></h1>
      <ul class="todos">
        <li v-for="(todo, index) in note.todos" :key="index" class="todo well">
          <div class="todo__main">
            <span class="check-bead">
              <input class="check" type="checkbox" :checked="todo.completed"
                aria-label="Mark as done in a local copy" @change="edit(index)" />
              <glass-icon name="check" />
            </span>
            <button class="todo__text" :class="{ completed: todo.completed }" type="button" @click="edit()">
              {{ todo.text || 'Empty todo' }}
            </button>
          </div>
        </li>
      </ul>
      <p v-if="!note.todos.length">No todos</p>
      <button class="btn btn--accent" type="button" @click="edit()">Edit a local copy</button>
    </template>
    <template v-else>
      <h1>Invalid shared link</h1>
      <p>This link is incomplete or contains an unsupported note. Ask the sender for a new link.</p>
      <router-link class="btn" to="/">Back to notes</router-link>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '@/store'
import { decodeNote } from '@/sharing'
import GlassIcon from '@/components/GlassIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()
const note = computed(() => typeof route.query.data === 'string' ? decodeNote(route.query.data) : null)
let opening = false
async function edit(toggleIndex?: number) {
  if (!note.value || opening) return
  opening = true
  store.startNewNote()
  store.currentNote = {
    title: note.value.title,
    todos: note.value.todos.map((todo, index) => ({ ...todo,
      completed: index === toggleIndex ? !todo.completed : todo.completed }))
  }
  store.saveNote()
  try {
    await router.push(`/note/${store.currentId}`)
  } finally {
    opening = false
  }
}
</script>
