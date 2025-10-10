import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createORM } from 'pinia-orm'
import App from './App.vue'
import router from './router'
import "./assets/css/neumorphism.css";

const pinia = createPinia().use(createORM())

createApp(App).use(pinia).use(router).mount('#app')
