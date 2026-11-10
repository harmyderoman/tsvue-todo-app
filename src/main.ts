import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { trackGlassPointer } from './glass'
import './assets/css/main.css'

trackGlassPointer()

createApp(App).use(store).use(router).mount('#app')
