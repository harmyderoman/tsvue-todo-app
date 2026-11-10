import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import List from '@/views/List.vue'
import Note from '@/views/Note.vue'
import Shared from '@/views/Shared.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/shared', name: 'Shared', component: Shared },
  {
    path: '/',
    name: 'List',
    component: List
  },
  {
    path: '/note',
    name: 'Create',
    component: Note
  },
  {
    path: '/note/:id',
    name: 'Edit',
    component: Note
  }
]

// Hash history: GitHub Pages has no server-side fallback, so deep links
// like /note/3 would 404 on reload with HTML5 history.
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
