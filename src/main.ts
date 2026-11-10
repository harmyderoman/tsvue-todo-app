import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { trackGlassPointer } from './glass'
import './assets/css/main.css'

trackGlassPointer()

createApp(App).use(createPinia()).use(router).mount('#app')
