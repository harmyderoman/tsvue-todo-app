import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { trackGlassPointer } from './glass'
import { installGlassTooltips } from './tooltip'
import './assets/css/main.css'

trackGlassPointer()
installGlassTooltips()

createApp(App).use(createPinia()).use(router).mount('#app')
