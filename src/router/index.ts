import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import List from '@/views/List.vue'
import Note from '@/views/Note.vue'

const routes: Array<RouteRecordRaw> = [
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

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

