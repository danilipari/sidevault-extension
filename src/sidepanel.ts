import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SidePanel from './app/SidePanel.vue'
import './assets/tailwind.css'

const app = createApp(SidePanel)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
