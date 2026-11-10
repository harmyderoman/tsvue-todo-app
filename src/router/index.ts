import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { initialRoute } from '@/navigation'
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

const restored = initialRoute(new URL(window.location.href), import.meta.env.BASE_URL)
if (restored) window.history.replaceState(window.history.state, '', restored)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
